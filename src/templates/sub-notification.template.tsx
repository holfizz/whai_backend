import { Body, Container, Font, Head, Heading, Html, Link, Text } from "@react-email/components";

export function NotificationTemplate({ name, subscriptionType, endDate }: { name: string; subscriptionType: string; endDate: string }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

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
            Ваша подписка заканчивается {formatDate(endDate)}
          </Heading>
          <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", textAlign: "center", marginBottom: "20px" }}>
            Привет, {name}!
            <br />
            Ваша подписка уровня {subscriptionType} заканчивается {formatDate(endDate)}. Пожалуйста, проверьте настройки автопродления или продлите подписку, чтобы не потерять
            доступ к нашим сервисам.
          </Text>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link
              href="https://whai.ru/ru/subscriptions"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                fontSize: "16px",
                color: "#ffffff",
                backgroundColor: "#ffb57f",
                borderRadius: "5px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Управление подпиской
            </Link>
          </div>
          <Text style={{ color: "#828282", fontSize: "14px", lineHeight: "20px", textAlign: "center", marginTop: "20px" }}>
            Если у вас возникли вопросы по вашей подписке, пожалуйста, свяжитесь с нашей поддержкой по почте{" "}
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
