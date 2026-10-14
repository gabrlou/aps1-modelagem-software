#!/bin/bash
set -e

# Navega até o diretório do projeto e pasta latex
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/latex"

echo "Compilando trabalho-modelagem-uml.pdf com Tectonic..."
tectonic trabalho-modelagem-uml.tex

echo "Sucesso! PDF compilado em: latex/trabalho-modelagem-uml.pdf"
