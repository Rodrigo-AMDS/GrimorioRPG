import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth-service";
import { createSession, currentSession } from "@/lib/session";
import { usernameSchema } from "@/lib/validation";

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await currentSession()) redirect("/painel");
  const { erro } = await searchParams;
  async function login(formData: FormData) { "use server";
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!usernameSchema.safeParse(username).success) redirect("/entrar?erro=credenciais");
    const user = await authenticate(username, password);
    if (!user) redirect("/entrar?erro=credenciais");
    await createSession(user); redirect("/painel");
  }
  return <main className="login-page"><section className="login" aria-labelledby="login-title"><div className="login-seal" aria-hidden="true">✦</div><p className="login-kicker">SOMENTE PARA CONVIDADOS</p><div className="brand">O GRIMÓRIO</div><p className="role">DO MESTRE</p><div className="login-divider" /><h1 id="login-title">Cruze o limiar.</h1><p className="login-lead">Apresente suas credenciais ao guardião do arquivo.</p>{erro && <p className="error">Nome de usuário ou senha inválidos.</p>}<form action={login}><label>Nome de usuário<input name="username" autoComplete="username" required /></label><label>Senha<input name="password" type="password" autoComplete="current-password" required /></label><button className="button login-button" type="submit">ABRIR O GRIMÓRIO <span>→</span></button></form><p className="login-footnote">As chaves de acesso são entregues pelo Mestre.</p></section></main>;
}
