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
export interface TinkoffNotificationDto {
  TerminalKey: string;
  OrderId: string;
  Success: boolean;
  Status: string;
  PaymentId: string;
  ErrorCode: string;
  Amount: number;
  CardId: number;
  Pan: string;
  ExpDate: string;
  RebillId: number;
  Token: string;
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
export interface TinkoffChargeResponse {
  TerminalKey: string;
  Amount: number;
  OrderId: string;
  Success: boolean;
  Status: string;
  PaymentId: string;
  ErrorCode: string;
  Message: string;
  Details: string;
}
