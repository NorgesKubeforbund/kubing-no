import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Heading,
} from "react-email";
import { ReactNode } from "react";
import {
  body,
  container,
  content,
  header,
  logo,
  outer,
  outerCell,
  title,
  titleCell,
} from "@/components/email/styles";

export default function EmailTemplate({ children }: { children: ReactNode }): ReactNode {
  return (
    <Html lang="no">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Body style={body}>
        <Section style={outer}>
          <Row>
            <Column align="center" style={outerCell}>
              <Container style={container}>
                <Section style={header}>
                  <Row>
                    <Column width={120} style={{ verticalAlign: "middle" }}>
                      <Img
                        src="https://kubing.no/android-chrome-384x384.png"
                        alt="NKF Logo"
                        width={120}
                        height={120}
                        style={logo}
                      />
                    </Column>
                    <Column style={titleCell}>
                      <Heading as="h1" style={title}>Norges<br />Kubeforbund</Heading>
                    </Column>
                  </Row>
                </Section>
                <Section style={content}>
                  {children}
                </Section>
              </Container>
            </Column>
          </Row>
        </Section>
      </Body>
    </Html>
  );
};
