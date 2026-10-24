const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  menuToggle.textContent = isOpen ? "×" : "☰";
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open"); menuToggle?.setAttribute("aria-expanded", "false");
  if (menuToggle) { menuToggle.textContent = "☰"; menuToggle.setAttribute("aria-label", "Ouvrir le menu"); }
}));
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll("[data-service]").forEach((link) => link.addEventListener("click", () => {
  const select = document.getElementById("service"), wanted = link.dataset.service;
  if (select && wanted) {
    const option = [...select.options].find((o) => o.text.toLowerCase() === wanted.toLowerCase());
    if (option) select.value = option.value;
  }
}));

// Supabase est initialisé uniquement si l'URL et la clé publique ont été configurées.
const supabaseReady = () => window.supabase?.createClient &&
  window.CONTREPOIDS_SUPABASE_URL?.startsWith("https://") &&
  window.CONTREPOIDS_SUPABASE_ANON_KEY &&
  !window.CONTREPOIDS_SUPABASE_ANON_KEY.includes("COLLEZ_ICI");
let db = null;
if (supabaseReady()) db = window.supabase.createClient(window.CONTREPOIDS_SUPABASE_URL, window.CONTREPOIDS_SUPABASE_ANON_KEY);

// Mesure simple et anonyme des visites. Aucun nom, téléphone ou adresse n'est collecté ici.
async function trackVisit() {
  if (!db) return;
  try {
    let sid = sessionStorage.getItem("cp_session_id");
    if (!sid) { sid = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`); sessionStorage.setItem("cp_session_id", sid); }
    await db.from("site_events").insert({ session_id: sid, event_name: "page_view", page_path: location.pathname.slice(0, 300) || "/" });
  } catch (e) { console.warn("Suivi de visite indisponible.", e); }
}
trackVisit();

const form = document.getElementById("contactForm");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const request = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim() || null,
    service: String(data.get("service") || "").trim(),
    message: String(data.get("message") || "").trim()
  };
  const status = document.getElementById("formStatus");
  const button = form.querySelector('button[type="submit"]');
  if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
  if (status) status.textContent = db ? "Enregistrement de votre demande…" : "Base de données non configurée : ouverture de WhatsApp…";
  let reference = "";
  if (db) {
    try {
      const { error } = await db.from("contact_requests").insert(request);
      if (error) throw error;
      reference = "ENREGISTREE";
    } catch (error) {
      console.error("Échec de l'enregistrement Supabase:", error);
      if (status) status.textContent = "L'enregistrement en ligne a échoué. Votre demande sera préparée dans WhatsApp pour éviter de la perdre.";
    }
  }
  const message = [
    "Bonjour CONTREPOIDS — Les missionnaires du développement,", "",
    "Je souhaite demander un devis / commander un service.", `Nom : ${request.name}`,
    request.phone ? `Téléphone : ${request.phone}` : "", `Service : ${request.service}`,
    `Projet : ${request.message}`, reference ? `Référence de demande : ${reference}` : "", "Merci."
  ].filter(Boolean).join("\n");
  if (reference && status) status.textContent = "Demande enregistrée avec succès dans la base de données. WhatsApp va s’ouvrir pour confirmer votre commande.";
  else if (!db && status) status.textContent = "Pour enregistrer automatiquement les demandes, configurez Supabase. WhatsApp va s'ouvrir maintenant.";
  const url = `https://wa.me/243829603023?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) location.href = url;
  if (button) { button.disabled = false; button.removeAttribute("aria-busy"); }
});
