import { useEffect, useState } from "react";

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);

  useEffect(() => {
    fetch("http://localhost/SAE/backend/api/etudiants.php")
      .then((res) => res.json())
      .then((data) => setEtudiants(data))
      .catch((err) => console.error(err));
  }, []);
  console.log(etudiants);
  return (
    <div>
      <h2>Étudiants</h2>

      {etudiants.map((e) => (
        <div key={`${e.code_module}-${e.code_session}-${e.id_etudiant}`}>
          <p>
            {e.id_etudiant} - {e.genre} - {e.region} - {e.resultat_final}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Etudiants;