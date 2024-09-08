import { Body, Container, Font, Head, Heading, Html, Text } from "@react-email/components";

export function TrialNotificationTemplate({
  name,
  endDate,
  type, // 'reminder' or 'notification'
}: {
  name: string;
  endDate?: string; // Optional for notification type
  type: "reminder" | "notification";
}) {
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
          {type === "reminder" ? (
            <>
              <Heading as="h1" style={{ color: "#ffb57f", fontSize: "24px", lineHeight: "32px", textAlign: "center", marginBottom: "20px" }}>
                Ваша подписка заканчивается через 1 день
              </Heading>
              <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", textAlign: "center", marginBottom: "20px" }}>
                Привет, {name}!
                <br />
                Мы хотим напомнить вам, что ваша пробная подписка истекает {formatDate(endDate!)}. Не упустите возможность продлить ее, чтобы продолжить использовать наши услуги
                без перерыва.
              </Text>
            </>
          ) : (
            <>
              <Heading as="h1" style={{ color: "#ffb57f", fontSize: "24px", lineHeight: "32px", textAlign: "center", marginBottom: "20px" }}>
                Ваша пробная подписка истекла
              </Heading>
              <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", textAlign: "center", marginBottom: "20px" }}>
                Привет, {name}!
                <br />
                Ваша пробная подписка на наши услуги истекла. Мы надеемся, что вы нашли наш сервис полезным. Если вы хотите продолжить пользоваться им, пожалуйста, посетите нашу
                страницу для продления подписки.
              </Text>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <a
                  href="https://whai.ru/subscriptions"
                  style={{
                    display: "inline-block",
                    padding: "15px 25px",
                    fontSize: "16px",
                    color: "#ffffff",
                    backgroundColor: "#000000",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Обновить подписку
                </a>
              </div>
            </>
          )}
          <Text style={{ color: "#828282", fontSize: "14px", lineHeight: "20px", textAlign: "center", marginTop: "20px" }}>
            Если у вас возникли вопросы, пожалуйста, свяжитесь с нашей поддержкой по почте{" "}
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
