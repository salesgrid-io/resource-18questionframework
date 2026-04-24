import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { env, isConfigured } from "@/lib/env"

async function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: env.googleServiceAccountEmail!,
    key: env.googlePrivateKey!,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })

  return google.sheets({ version: "v4", auth })
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  if (!isConfigured(env.googleServiceAccountEmail, env.googlePrivateKey, env.googleSheetsId)) {
    return NextResponse.json({ ok: false, error: "Google Sheets not configured" }, { status: 400 })
  }

  try {
    const sheets = await getSheetsClient()
    const url = new URL(request.url)
    const requestedSheet = url.searchParams.get("sheet")

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: env.googleSheetsId!,
      includeGridData: false,
    })

    const tabs =
      spreadsheet.data.sheets?.map((sheet) => ({
        title: sheet.properties?.title ?? "",
        rowCount: sheet.properties?.gridProperties?.rowCount ?? 0,
        columnCount: sheet.properties?.gridProperties?.columnCount ?? 0,
      })) ?? []

    const targetTabs = requestedSheet ? tabs.filter((tab) => tab.title === requestedSheet) : tabs

    const schemas = await Promise.all(
      targetTabs.map(async (tab) => {
        const range = `${tab.title}!1:3`
        const values =
          (
            await sheets.spreadsheets.values.get({
              spreadsheetId: env.googleSheetsId!,
              range,
            })
          ).data.values ?? []

        return {
          ...tab,
          columns: values[0] ?? [],
          sampleRows: values.slice(1),
        }
      }),
    )

    return NextResponse.json({
      ok: true,
      spreadsheetTitle: spreadsheet.data.properties?.title ?? "",
      tabs: schemas,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
