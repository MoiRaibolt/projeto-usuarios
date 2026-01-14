import { useEffect, useState } from "react";
import { api } from "../services/api";
import axios from "axios";

/* ================== TIPOS ================== */
type User = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  cpf: string;
};

type UserForm = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  cpf: string;
};

/* ================== COMPONENTE ================== */
export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    cpf: "",
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ================== LOAD USERS ================== */
  useEffect(() => {
    (async () => {
      const { data } = await api.get<User[]>("/users");
      setUsers(data);
    })();
  }, []);

  const reloadUsers = async () => {
    const { data } = await api.get<User[]>("/users");
    setUsers(data);
  };

  /* ================== VALIDAÇÃO ================== */
  const validateForm = (): boolean => {
    setError(null);

    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        setError(`O campo "${key}" é obrigatório.`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("E-mail inválido.");
      return false;
    }

    const cpfClean = form.cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      setError("CPF deve conter 11 dígitos.");
      return false;
    }

    return true;
  };

  /* ================== CRUD ================== */
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await api.post("/users", {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
      });

      resetForm();
      reloadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Já existe um usuário com este CPF.");
      } else {
        setError("Erro ao cadastrar usuário.");
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cep: user.cep,
      cpf: user.cpf,
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    if (!validateForm()) return;

    await api.put(`/users/${editingUser.id}`, {
      ...form,
      cpf: form.cpf.replace(/\D/g, ""),
    });

    setEditingUser(null);
    resetForm();
    reloadUsers();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resetForm = () => {
    setForm({
      nome: "",
      email: "",
      telefone: "",
      cep: "",
      cpf: "",
    });
    setError(null);
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Cadastro de Usuários
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* FORMULÁRIO */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(form) as (keyof UserForm)[]).map((field) => (
            <input
              key={field}
              placeholder={field}
              className="border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
        </div>

        <div className="mb-8">
          <button
            onClick={editingUser ? handleUpdate : handleCreate}
            className={`${
              editingUser
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-3 rounded-lg font-medium transition`}
          >
            {editingUser ? "Salvar alterações" : "Adicionar usuário"}
          </button>

          {editingUser && (
            <button
              onClick={() => {
                setEditingUser(null);
                resetForm();
              }}
              className="ml-4 text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar edição
            </button>
          )}
        </div>

        {/* LISTAGEM */}
        <ul className="space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex justify-between items-center
                         bg-gray-50 border border-gray-200
                         p-4 rounded-lg hover:shadow transition"
            >
              <span className="text-gray-700">
                <strong className="text-gray-900">{user.nome}</strong>
                <br />
                <span className="text-sm">{user.email}</span>
              </span>

              <div className="flex gap-4">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
