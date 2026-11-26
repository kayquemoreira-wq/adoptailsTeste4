from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

CONFIG_BANCO = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "adoptails",
}


def conectar():
    return mysql.connector.connect(**CONFIG_BANCO)


@app.get("/api/animais")
def listar_animais():
    con = conectar()
    try:
        cur = con.cursor(dictionary=True)
        cur.execute(
            "SELECT id, nome, especie, idade, foto "
            "FROM animal WHERE adotado = FALSE ORDER BY id DESC"
        )
        return jsonify(cur.fetchall())
    finally:
        con.close()


@app.post("/api/animais")
def cadastrar_animal():
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    especie = (dados.get("especie") or "").strip()
    idade = (dados.get("idade") or "").strip()
    foto = dados.get("foto") or None

    if not nome or not especie:
        return Response("Nome e espécie são obrigatórios.", status=400)

    con = conectar()
    try:
        cur = con.cursor()
        cur.execute(
            "INSERT INTO animal (nome, especie, idade, foto, adotado) "
            "VALUES (%s, %s, %s, %s, FALSE)",
            (nome, especie, idade, foto),
        )
        con.commit()
        return jsonify({"id": cur.lastrowid, "nome": nome}), 201
    finally:
        con.close()

@app.post("/api/adocoes")
def pedir_adocao():
    dados = request.get_json(silent=True) or {}
    animal_id = dados.get("animalId")
    nome = (dados.get("nomeInteressado") or "").strip()
    email = (dados.get("email") or "").strip()

    if not animal_id or not nome or not email:
        return Response("Preencha nome e e-mail.", status=400)

    con = conectar()
    try:
        cur = con.cursor()
        cur.execute("SELECT id FROM animal WHERE id = %s", (animal_id,))
        if cur.fetchone() is None:
            return Response("Animal não encontrado.", status=404)

        cur.execute(
            "INSERT INTO adocao (animal_id, nome_interessado, email) "
            "VALUES (%s, %s, %s)",
            (animal_id, nome, email),
        )
        con.commit()
        return Response(
            f"Pedido de adoção enviado com sucesso, {nome}! "
            f"Entraremos em contato pelo e-mail {email}.",
            status=201,
        )
    finally:
        con.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
