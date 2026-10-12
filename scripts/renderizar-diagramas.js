// Gera os SVGs dos diagramas PlantUML de trabalho-modelagem-uml-final.md em assets/.
// Uso:  node scripts/renderizar-diagramas.js
// Precisa de Java e do plantuml.jar (variável PLANTUML_JAR, ou o jar da extensão
// "PlantUML" do VS Code). Os diagramas de classes precisam do Graphviz (dot).
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const raiz = path.join(__dirname, "..");
const origem = path.join(raiz, "trabalho-modelagem-uml-final.md");
const saida = path.join(raiz, "assets");

function acharJar() {
  if (process.env.PLANTUML_JAR) return process.env.PLANTUML_JAR;
  const ext = path.join(os.homedir(), ".vscode", "extensions");
  if (!fs.existsSync(ext)) return null;
  const pasta = fs.readdirSync(ext).filter((n) => n.startsWith("jebbs.plantuml-")).sort().pop();
  return pasta ? path.join(ext, pasta, "plantuml.jar") : null;
}

const jar = acharJar();
if (!jar || !fs.existsSync(jar)) {
  console.error("plantuml.jar não encontrado. Instale a extensão PlantUML do VS Code ou defina PLANTUML_JAR.");
  process.exit(1);
}

const blocos = [...fs.readFileSync(origem, "utf8").matchAll(/```plantuml\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
if (!blocos.length) {
  console.error("Nenhum bloco ```plantuml encontrado em trabalho-modelagem-uml-final.md.");
  process.exit(1);
}
fs.mkdirSync(saida, { recursive: true });

let falhas = 0;
for (const fonte of blocos) {
  const nome = (fonte.match(/@startuml\s+(\w+)/) || [])[1] || "diagrama" + blocos.indexOf(fonte);
  const r = spawnSync("java", ["-Djava.awt.headless=true", "-jar", jar, "-tsvg", "-charset", "UTF-8", "-pipe"], {
    input: fonte,
    maxBuffer: 64 * 1024 * 1024,
  });
  const svg = r.stdout ? r.stdout.toString("utf8") : "";
  // o PlantUML devolve um SVG mesmo com erro; detecta pelo texto da mensagem
  const erro = r.status !== 0 || !svg.includes("<svg") || /Syntax Error|An error has occured|Cannot find Graphviz/i.test(svg);
  if (erro) {
    falhas++;
    console.error(`FALHOU ${nome}: ${(r.stderr || "").toString().slice(0, 300) || "ver o diagrama (erro de sintaxe ou Graphviz ausente)"}`);
    continue;
  }
  fs.writeFileSync(path.join(saida, nome + ".svg"), svg, "utf8");
  console.log(`ok  assets/${nome}.svg (${Math.round(svg.length / 1024)} KB)`);
}
process.exit(falhas ? 1 : 0);
