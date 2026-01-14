import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  return res.json(users);
}

export async function createUser(req: Request, res: Response) {
  try {
    const { nome, email, telefone, cep, cpf } = req.body;

    const user = await prisma.user.create({
      data: { nome, email, telefone, cep, cpf },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "CPF ou e-mail já cadastrado",
      });
    }

    return res.status(500).json({ message: "Erro interno" });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: req.body,
  });

  return res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id: Number(id) },
  });

  return res.status(204).send();
}
