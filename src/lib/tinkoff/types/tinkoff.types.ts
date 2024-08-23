import { TransactionStatus } from "@prisma/client";

export interface IInitPaymentRequest {
  TerminalKey: string; // Идентификатор терминала
  Amount: number; // Сумма платежа в копейках
  OrderId: string; // Идентификатор заказа
  Description?: string; // Описание заказа
  DATA?: {
    Phone?: string; // Телефон покупателя
    Email?: string; // Электронная почта покупателя
    OperationInitiatorType: 0 | 1 | 2 | "R" | "I"; // Признак инициатора операции
  };
  Receipt?: {
    Email?: string; // Электронная почта для чека
    Phone?: string; // Телефон для чека
    Taxation?: "osn" | "usn_income" | "usn_income_out" | "envd" | "esn"; // Система налогообложения
    Items?: {
      Name: string; // Наименование товара
      Price: number; // Цена товара в копейках
      Quantity: number; // Количество товара
      Amount: number; // Сумма товара в копейках
      Tax?: "vat10" | "vat20" | "vat0" | "vat110" | "vat120" | "vat130"; // Налог на товар
      Ean13?: string; // Штрих-код товара (опционально)
    }[];
  };
}

// Ответ на инициализацию платежа
export interface IInitPaymentResponse {
  Success: boolean; // Успешность запроса
  PaymentURL?: string; // URL для переадресации клиента на страницу оплаты
  PaymentId?: string; // Идентификатор платежа
  Error?: {
    Code: string; // Код ошибки
    Message: string; // Сообщение об ошибке
  };
}

export interface IRecurrentPaymentRequest extends IInitPaymentRequest {
  Recurrent: boolean; // Признак рекуррентного платежа
}
export interface IChargeRecurrentPaymentRequest {
  TerminalKey: string; // Идентификатор терминала
  RebillId: string; // Идентификатор рекуррентного платежа
}

// Ответ на списание средств по рекуррентному платежу
export interface IChargeRecurrentPaymentResponse {
  Success: boolean; // Успешность запроса
  Status: "AUTHORIZED" | "CONFIRMED" | "REJECTED"; // Статус платежа
  Error?: {
    Code: string; // Код ошибки
    Message: string; // Сообщение об ошибке
  };
}
export interface INotificationBase {
  TerminalKey: string; // Идентификатор терминала
  Amount: number; // Сумма в копейках
  OrderId: string; // Идентификатор заказа в системе Мерчанта
  Success: boolean;
  Status: TransactionStatus;
  PaymentId: number; // Уникальный идентификатор транзакции в системе Т‑Кассы
  ErrorCode: string; // Код ошибки. «0» в случае успеха
  Message?: string; // Краткое описание ошибки
  Details?: string; // Подробное описание ошибки
  Token: string; // Подпись запроса
  DATA?: Record<string, any>;
  RebillId?: number; // Идентификатор автоплатежа (для рекуррентных платежей)
  CardId?: number; // Идентификатор карты в системе Т‑Кассы
  Pan?: string; // Замаскированный номер карты/телефона (если нужно)// Дополнительные параметры платежа
}
export interface TinkoffReqResult {
  Success: boolean;
  ErrorCode: string;
  TerminalKey: string;
  Status: string;
  PaymentId: string;
  OrderId: string;
  Amount: number;
  PaymentURL: string;
}
