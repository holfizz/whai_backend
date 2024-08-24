import { Body, Container, Font, Head, Heading, Html, Text } from "@react-email/components";

export function InvoiceTemplate({ amount, months, subscriptionType, date, name }: { amount: string; months: number; subscriptionType: string; date: string; name: string }) {
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
            Ваш чек от {date}
          </Heading>
          <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", textAlign: "center", marginBottom: "20px" }}>
            Привет, {name}!
            <br />
            Мы рады сообщить вам, что ваш платеж был успешно обработан. Вот информация о вашем заказе:
          </Text>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", marginBottom: "10px" }}>
              <strong>Сумма:</strong> {amount}руб.
            </Text>
            <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", marginBottom: "10px" }}>
              <strong>Количество месяцев:</strong> {months}
            </Text>
            <Text style={{ color: "#272727", fontSize: "16px", lineHeight: "24px", marginBottom: "10px" }}>
              <strong>Тип подписки:</strong> {subscriptionType}
            </Text>
          </div>
          <Text style={{ color: "#828282", fontSize: "14px", lineHeight: "20px", textAlign: "center" }}>
            Если у вас возникли вопросы по вашему платежу, пожалуйста, свяжитесь с нашей поддержкой по почте{" "}
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
