import "next";

declare module "next" {
  // Переозначаємо тип контексту для маршруту
  export interface RouteContext {
    params: Record<string, string>;
  }
}

// Ігноруємо нову перевірку типів для API route definitions (Next 15)
declare global {
  // Використовуємо Record<string, unknown> замість any
  type ParamCheck<T> = Record<string, unknown>;
}
