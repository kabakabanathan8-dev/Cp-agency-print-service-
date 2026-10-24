# CONTREPOIDS Agency & Print — site avec intégration Supabase

Site vitrine responsive en HTML, CSS et JavaScript. Le formulaire peut enregistrer les demandes de devis/commandes dans Supabase et mesurer les visites de manière anonyme, puis ouvrir WhatsApp pour le suivi.

## Activer la base de données (nécessaire une seule fois)

1. Créez un projet dans Supabase : https://supabase.com/dashboard .
2. Dans le projet, ouvrez **SQL Editor** → **New query**.
3. Copiez tout le contenu de `supabase_schema.sql`, collez-le dans l'éditeur, puis cliquez **Run**.
4. Dans Supabase, ouvrez **Project Settings** → **API** (ou **Connect**) et copiez le **Project URL** ainsi que la clé **anon/public**.
5. Ouvrez `supabase-config.js` et remplacez les deux textes `COLLEZ_ICI...` par vos valeurs. Exemple de format URL : `https://abcdefgh.supabase.co`. Ne partagez pas votre clé en public dans une capture d'écran.
6. Enregistrez le fichier et envoyez tous les fichiers du dossier dans GitHub, y compris `supabase-config.js` et `supabase_schema.sql`.
7. Si Vercel est déjà connecté à GitHub, le site sera redéployé automatiquement après le push. Testez le formulaire avec une demande fictive, puis vérifiez **Supabase → Table Editor → contact_requests**.

## Ce qui fonctionne après configuration

- Enregistrement des demandes avec nom, téléphone facultatif, service, description, date et référence générée en base.
- Ouverture de WhatsApp au numéro professionnel configuré dans `script.js` pour que le client confirme sa demande.
- Comptage simple des visites avec un identifiant de session aléatoire, sans nom ni téléphone, dans `site_events`.
- Protection RLS : le public peut ajouter une demande ou un événement, mais ne peut pas lire les demandes des autres clients.

## Important — sécurité et limites

- La base ne peut pas être activée dans votre compte à distance sans l'URL et la clé publique de votre projet Supabase. Le fichier `supabase-config.js` est donc à compléter avec vos propres valeurs.
- La clé `anon/public` est prévue pour le navigateur avec les politiques RLS. **Ne mettez jamais la clé `service_role` dans le site.**
- Consultez les demandes dans Supabase avec le compte propriétaire : **Table Editor → contact_requests**. Ne créez pas de politique publique de lecture.
- L'espace client visible est un espace de démarrage ; l'authentification individuelle, l'historique personnel des commandes et le tableau de bord d'administration nécessitent une étape supplémentaire avec Supabase Auth et des politiques adaptées.
- Les visites sont enregistrées si les scripts Supabase sont accessibles et la configuration est valide. Les visiteurs doivent être informés du suivi dans la politique de confidentialité.

## Tester localement

Décompressez le ZIP et ouvrez le dossier dans VS Code. Pour les tests de Supabase, servez le dossier via Live Server ou un hébergement web plutôt que d'ouvrir directement le fichier `index.html`.
