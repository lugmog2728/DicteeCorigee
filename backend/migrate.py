"""
Applique les migrations manquantes sans supprimer les données.
Usage : python migrate.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine


MIGRATIONS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)",
]


async def main() -> None:
    async with engine.begin() as conn:
        for sql in MIGRATIONS:
            await conn.execute(text(sql))
            print(f"OK : {sql}")
    print("Migration terminée.")


if __name__ == "__main__":
    asyncio.run(main())
