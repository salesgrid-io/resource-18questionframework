import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface BlueprintEmailProps {
  firstName?: string
  blueprintUrl: string
}

// Brand colors
const colors = {
  gold: "#b59e5f",
  goldLight: "#C4A855",
  background: "#06090F",
  backgroundDark: "#04070d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
}

export function BlueprintEmail({ firstName = "there", blueprintUrl }: BlueprintEmailProps) {
  const previewText = `Your 18 Question Framework Blueprint is ready`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>18 Question Framework</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Your Blueprint is Ready</Heading>

            <Text style={greeting}>Hi {firstName},</Text>

            <Text style={paragraph}>
              Here we have your blueprint. Just click on the link to access it.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={blueprintUrl}>
                View Your Blueprint
              </Button>
            </Section>

            <Text style={paragraphSmall}>
              Or copy and paste this link into your browser:
            </Text>
            <Link href={blueprintUrl} style={link}>
              {blueprintUrl}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              18 Question Framework
            </Text>
            <Text style={footerSubtext}>
              Transforming brands through strategic clarity
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: colors.backgroundDark,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
}

const header: React.CSSProperties = {
  textAlign: "center",
  padding: "20px 0",
}

const logoText: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: colors.gold,
  letterSpacing: "0.5px",
  margin: "0",
}

const content: React.CSSProperties = {
  backgroundColor: colors.background,
  borderRadius: "12px",
  padding: "40px",
  border: `1px solid ${colors.gold}20`,
}

const heading: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: colors.textPrimary,
  textAlign: "center",
  margin: "0 0 30px 0",
}

const greeting: React.CSSProperties = {
  fontSize: "18px",
  color: colors.textPrimary,
  lineHeight: "1.6",
  margin: "0 0 20px 0",
}

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  color: colors.textSecondary,
  lineHeight: "1.7",
  margin: "0 0 30px 0",
}

const paragraphSmall: React.CSSProperties = {
  fontSize: "14px",
  color: colors.textSecondary,
  lineHeight: "1.6",
  margin: "30px 0 10px 0",
}

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
}

const button: React.CSSProperties = {
  backgroundColor: colors.gold,
  color: colors.background,
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "16px 40px",
  borderRadius: "8px",
  display: "inline-block",
}

const link: React.CSSProperties = {
  color: colors.goldLight,
  fontSize: "14px",
  wordBreak: "break-all",
}

const divider: React.CSSProperties = {
  borderColor: `${colors.gold}30`,
  margin: "40px 0",
}

const footer: React.CSSProperties = {
  textAlign: "center",
  padding: "20px 0",
}

const footerText: React.CSSProperties = {
  fontSize: "14px",
  color: colors.gold,
  fontWeight: "600",
  margin: "0 0 8px 0",
}

const footerSubtext: React.CSSProperties = {
  fontSize: "12px",
  color: colors.textSecondary,
  margin: "0",
}

export default BlueprintEmail
