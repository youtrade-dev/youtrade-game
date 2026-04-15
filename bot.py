import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://youtrade-dev.github.io/youtrade-game")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🎮 Играть в YouTrade GAME",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ], [
        InlineKeyboardButton(
            text="🏆 Лидерборд",
            callback_data="leaderboard"
        ),
        InlineKeyboardButton(
            text="🚀 Купить Challenge",
            url="https://youtrade.com/challenge?ref=bot"
        )
    ]])
    
    await message.answer(
        "🎮 *YouTrade GAME*\n\n"
        "Торгуй виртуально — зарабатывай реально!\n\n"
        "• Виртуальный prop-аккаунт $10,000\n"
        "• Реальные цены XAUUSD, EURUSD\n"
        "• Правила как в настоящем Challenge\n"
        "• Лидерборд среди всех игроков\n\n"
        "Набери +8% — получи скидку 20% на Challenge! 🔥",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    await message.answer(
        "📋 *Правила YouTrade GAME*\n\n"
        "1. Стартовый баланс: $10,000\n"
        "2. Цель: заработать +8% (=$800)\n"
        "3. Дневной лимит потерь: -$500 (5%)\n"
        "4. Максимальная просадка: -$1,000 (10%)\n"
        "5. Торговые инструменты: XAUUSD, EURUSD, BTCUSD\n\n"
        "🏆 Достигни цели — получи скидку 20% на реальный Prop Challenge!",
        parse_mode="Markdown"
    )

@dp.callback_query(lambda c: c.data == "leaderboard")
async def show_leaderboard(callback: types.CallbackQuery):
    await callback.message.answer(
        "🏆 *Топ трейдеров сегодня*\n\n"
        "🥇 AlexTrader: +18.3%\n"
        "🥈 MarketGuru: +15.7%\n"
        "🥉 GoldHunter: +12.1%\n"
        "4\. NQScalper: +9.8%\n"
        "5\. EuroKing: +8.2%\n\n"
        "Твоя позиция: #47 (+2.45%)\n\n"
        "Продолжай торговать, чтобы подняться в топ! 💪",
        parse_mode="Markdown"
    )
    await callback.answer()

async def main():
    print(f"Bot started. WebApp URL: {WEBAPP_URL}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
