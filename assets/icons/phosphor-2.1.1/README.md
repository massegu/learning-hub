# Phosphor Icons — Duotone 2.1.1

Seleccionado por el usuario el 30/10/2026 para los estímulos de adolescentes. Archivos oficiales de `@phosphor-icons/core@2.1.1/assets/duotone`, distribuidos en unpkg, bajo la licencia MIT incluida. Biblioteca: https://phosphoricons.com .

`mapping.json` relaciona 74 claves ya existentes con equivalentes fieles. No se fuerza un sustituto cuando no hay un equivalente adecuado. Los objetos con estados o colores que forman parte de la respuesta conservan su representación original.

`python3 scripts/build-phosphor-art.py` normaliza las coordenadas de estos SVG a la misma escala 64×64 y rasteriza fielmente a PNG mediante Chromium para Word. El resultado precompilado, sin dependencias de red, está en `js/phosphor-art.js`. La elección por franja la realiza `ActivityModel.artFor`: Calma mantiene los dibujos previos; 13–18 usa Phosphor cuando existe un equivalente. La escala de pantalla y el tamaño de la ficha se controlan por separado.
