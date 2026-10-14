#!/bin/bash
set -e

# Navega até o diretório do projeto e pasta latex
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Compila relatório ABNT
cd "$ROOT_DIR/latex"
echo "Compilando trabalho-modelagem-uml.pdf com Tectonic..."
tectonic trabalho-modelagem-uml.tex
echo "Sucesso! Relatório em: latex/trabalho-modelagem-uml.pdf"

# Compila slides da apresentação se existirem
if [ -f "$ROOT_DIR/slides/apresentacao-aps1.tex" ]; then
    cd "$ROOT_DIR/slides"
    echo "Compilando apresentacao-aps1.pdf com Tectonic..."
    tectonic apresentacao-aps1.tex
    echo "Sucesso! Slides em: slides/apresentacao-aps1.pdf"
fi
