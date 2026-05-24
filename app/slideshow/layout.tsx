/**
 * Layout dedicado — sem Navbar, sem Sparkles, fundo preto (TV / telão).
 * Sobrescreve o root layout? Não, mas escondemos a navbar via CSS pelo client.
 * Como o root layout monta sempre, o componente Slideshow ocupa tela inteira e
 * o body já é preto via classe utilitária aqui aplicada via wrapper.
 */
export default function SlideshowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="slideshow-root">{children}</div>;
}
