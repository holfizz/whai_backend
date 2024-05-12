import { Font, Head, Heading, Html, Link } from "@react-email/components";
import React from "react";
export function AuthTemplate({ link }: { link: string }) {
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
      <Heading as="h1">Подтвердите почту</Heading>
      <Link href={link}>{link}</Link>
    </Html>
  );
}
