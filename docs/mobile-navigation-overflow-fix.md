# Menú de áreas en pantallas estrechas

El trabajo de la PR #17 ya está integrado en `desarrollo`. Esta corrección parte de ese estado.

La comprobación de recuperación de contraseña puede detectar desbordamiento horizontal del espacio de trabajo que queda detrás del diálogo. Los iconos nuevos con tamaño fijo y los textos como «Velocidad de procesamiento» formaban elementos flexibles cuyo ancho mínimo ensanchaba las columnas del menú móvil. Con el código anterior se reprodujo una página de 339 px dentro de un viewport de 320 px. El caso concreto de 390 px informado por GitHub no falló con Chromium local; se amplía la cobertura de anchos y métricas de texto para comprobar la causa de disposición encontrada.

Las columnas ahora pueden contraerse y el texto tiene un contenedor independiente que permite partir líneas sin encoger el icono ni recortar contenido. Los ajustes antiguos de etiquetas actualizan solo ese texto; conservan el icono y consultan las áreas actuales para no ocultar Social Lab en los perfiles pequeños.

La prueba mantiene la comprobación del ancho de toda la página, añade información sobre los elementos que se salen y comprueba 320, 360, 390 y 412 px, con texto normal, aumentado a 20 px y una familia tipográfica alternativa. También comprueba que las etiquetas e iconos sobrevivan a los cambios de cuenta y a la recuperación. La prueba de Social Lab confirma que la navegación no lo marque como oculto después de cargar sus ejercicios.

La verificación de la web publicada incorpora los tres scripts de etiquetas modificados. No se cambian autenticación, permisos de servidor, adaptación, documentos, contenidos ni pagos.

Validación final: 181 pruebas Node, 9 pruebas Python y tres recorridos de navegador (cuentas/recuperación, navegación y sesiones, Social Lab/escucha). Las pruebas de cuentas usan Auth simulado: no se envían correos reales. [Captura local de recuperación a 390 px](review-assets/mobile-navigation-fix/password-dialog-390.png).
