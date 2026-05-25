"""
Crée un utilisateur en base de données.
Usage : python create_user.py email@exemple.fr monmotdepasse "Prénom Nom"
"""
import asyncio
import sys
from sqlalchemy import select
from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


async def main(email: str, password: str, name: str) -> None:
    async with SessionLocal() as db:
        existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if existing:
            print(f"Erreur : un compte existe déjà pour {email}")
            return
        user = User(email=email, hashed_password=hash_password(password), name=name)
        db.add(user)
        await db.commit()
        print(f"Compte créé : {name} <{email}>")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print('Usage : python create_user.py <email> <password> "Prénom Nom"')
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
