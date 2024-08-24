import { Body, Container, Font, Head, Heading, Html, Link, Text } from "@react-email/components";

export function ResetPasswordTemplate({ link, email }: { link: string; email: string }) {
  return (
    <Html lang="ru">
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{ backgroundColor: "#f8f4f0", padding: "20px", fontFamily: "Roboto, Verdana, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "20px", borderRadius: "20px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
          <Heading as="h1" style={{ color: "#ffb57f", fontSize: "24px", lineHeight: "32px", textAlign: "center", marginBottom: "20px" }}>
            Сброс пароля
          </Heading>
          <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", textAlign: "center", marginBottom: "20px" }}>
            Вы запросили сброс пароля для адреса {email}. Пожалуйста, нажмите на ссылку ниже, чтобы ввести новый пароль:
          </Text>
          <Container align="center">
            <Link
              href={link}
              style={{
                display: "inline-block",
                padding: "16px 24px",
                fontSize: "16px",
                lineHeight: "24px",
                color: "#ffffff",
                backgroundColor: "#ffb57f",
                borderRadius: "30px",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Сбросить пароль
            </Link>
          </Container>
          <Text style={{ color: "#828282", fontSize: "14px", lineHeight: "20px", textAlign: "center", marginTop: "20px" }}>
            Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Если у вас возникли вопросы, свяжитесь с нашей поддержкой по почте{" "}
            <a href="mailto:support@whai.ru" style={{ color: "#ffb57f" }}>
              support@whai.ru
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
