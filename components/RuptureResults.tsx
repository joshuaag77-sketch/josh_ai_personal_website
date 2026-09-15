import styles from "./RuptureExperiment.module.css";

const rows = [
  ["Visual realism", "3", "4.5", "4.5"],
  ["Perceived physics", "3.5", "4.5", "4.5"],
  ["Impact and deformation", "3", "5", "5"],
  ["Lighting and cinematography", "4.5", "5", "5"],
  ["Visual interface quality", "8", "8.5", "8.5"],
];

export function RuptureResults() {
  return (
    <div className={styles.results}>
      <table>
        <caption>Three additional critic rounds · scores out of 10</caption>
        <thead>
          <tr><th scope="col">Criterion</th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, ...scores]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {scores.map((score, index) => <td key={index}>{score}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
