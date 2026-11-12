#!/usr/bin/env python3
"""Camada de dados CDA (Fase 3).

SQLite por defeito, migrável para PostgreSQL mudando DATABASE_URL.
Estrutura isolada (SQLAlchemy 2.0) para facilitar expansão futura.
"""
import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

ENV = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV)

RAIZ = Path(__file__).resolve().parent.parent

# SQLite por defeito; para Postgres definir, ex.:
#   DATABASE_URL=postgresql+psycopg://user:pass@host:5432/cda
DEFAULT_URL = "sqlite:///" + str((RAIZ / "cda.db").resolve())
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_URL)

_engine_kwargs = {"echo": False}
if (DATABASE_URL or "").startswith("sqlite"):
    _engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, future=True, **_engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def agora() -> datetime:
    return datetime.now(timezone.utc)


class Membro(Base):
    __tablename__ = "membros"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    hash_senha: Mapped[str] = mapped_column(String(300), nullable=False)
    telefone: Mapped[str] = mapped_column(String(40), default="")
    entidade: Mapped[str] = mapped_column(String(160), default="")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    carteira: Mapped[str | None] = mapped_column(String(40), unique=True, index=True, nullable=True)
    aprovado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Noticia(Base):
    __tablename__ = "noticias"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    categoria: Mapped[str] = mapped_column(String(80), default="")
    data: Mapped[str] = mapped_column(String(20), nullable=False, default="")  # YYYY-MM-DD
    resumo: Mapped[str] = mapped_column(Text, default="")
    texto: Mapped[str] = mapped_column(Text, default="")
    imagem: Mapped[str] = mapped_column(String(300), default="")
    activ_id: Mapped[int | None] = mapped_column(ForeignKey("actividades.id"), nullable=True)
    publicada: Mapped[bool] = mapped_column(Boolean, default=True)


class Actividade(Base):
    __tablename__ = "actividades"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    categoria: Mapped[str] = mapped_column(String(80), default="")
    data: Mapped[str] = mapped_column(String(20), default="")
    local: Mapped[str] = mapped_column(String(160), default="")
    descricao: Mapped[str] = mapped_column(Text, default="")
    destaque: Mapped[bool] = mapped_column(Boolean, default=False)
    capas: Mapped[str] = mapped_column(Text, default="[]")  # JSON list of filenames/gallery
    noticia_id: Mapped[int | None] = mapped_column(ForeignKey("noticias.id"), nullable=True)
    documentos: Mapped[str] = mapped_column(Text, default="[]")  # JSON list of doc filenames

    noticia: Mapped["Noticia | None"] = relationship(
        foreign_keys=[noticia_id], viewonly=True)


class DocumentoMeta(Base):
    __tablename__ = "documentos_meta"

    id: Mapped[int] = mapped_column(primary_key=True)
    ficheiro: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    titulo: Mapped[str] = mapped_column(String(400), nullable=False)
    tipo: Mapped[str] = mapped_column(String(80), default="")
    entidade: Mapped[str] = mapped_column(String(160), default="")
    ano: Mapped[int | None] = mapped_column(Integer, nullable=True)
    categoria: Mapped[str] = mapped_column(String(80), default="")
    status: Mapped[str] = mapped_column(String(40), default="vigente")  # vigente/revogado/substituido
    url: Mapped[str] = mapped_column(String(300), default="")
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class ContactoMsg(Base):
    __tablename__ = "contacto_msg"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    assunto: Mapped[str] = mapped_column(String(200), default="")
    mensagem: Mapped[str] = mapped_column(Text, nullable=False)
    ip: Mapped[str] = mapped_column(String(80), default="")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    lida: Mapped[bool] = mapped_column(Boolean, default=False)


class Quota(Base):
    __tablename__ = "quotas"

    id: Mapped[int] = mapped_column(primary_key=True)
    membro_id: Mapped[int] = mapped_column(ForeignKey("membros.id"), index=True, nullable=False)
    ano: Mapped[int] = mapped_column(Integer, nullable=False)
    valor: Mapped[int] = mapped_column(Integer, default=0)  # Meticais, sem centavos
    estado: Mapped[str] = mapped_column(String(30), default="pendente")  # pendente/paga/em_atraso/isenta
    referencia: Mapped[str] = mapped_column(String(120), default="")
    data_pagamento: Mapped[str] = mapped_column(String(20), default="")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)


class Requerimento(Base):
    __tablename__ = "requerimentos"

    id: Mapped[int] = mapped_column(primary_key=True)
    membro_id: Mapped[int] = mapped_column(ForeignKey("membros.id"), index=True, nullable=False)
    tipo: Mapped[str] = mapped_column(String(80), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, default="")
    estado: Mapped[str] = mapped_column(String(30), default="em_analise")  # em_analise/aprovado/rejeitado
    resposta: Mapped[str] = mapped_column(Text, default="")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora, onupdate=agora)


def _migrar_colunas() -> None:
    """Migração leve para BD SQLite já existente (create_all não altera colunas)."""
    if not (DATABASE_URL or "").startswith("sqlite"):
        return
    with engine.begin() as conn:
        colunas = {linha[1] for linha in conn.execute(text("PRAGMA table_info(membros)"))}
        if "carteira" not in colunas:
            conn.execute(text("ALTER TABLE membros ADD COLUMN carteira VARCHAR(40)"))
        if "aprovado_em" not in colunas:
            conn.execute(text("ALTER TABLE membros ADD COLUMN aprovado_em DATETIME"))
        conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_membros_carteira ON membros (carteira)"))


def criar_tabelas() -> None:
    Base.metadata.create_all(engine)
    _migrar_colunas()


def sessao() -> Session:
    return SessionLocal()
