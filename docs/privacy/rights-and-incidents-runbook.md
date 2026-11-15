# Procedimiento operativo para completar y ensayar

## Solicitudes de personas y profesionales

Recibir en learninghub2026@proton.me sin pedir historias clínicas por correo. Verificar la identidad y la relación con la cuenta antes de entregar información. Para una solicitud relativa a un menor, coordinar con el profesional/centro responsable y comprobar la representación que proceda. No intentar identificar al menor a partir de un alias sin necesidad.

Registrar tipo de solicitud, responsable de tramitarla, fechas y resolución, evitando copiar respuestas o diagnósticos en el registro. Usar la exportación JSON del perfil para acceso/portabilidad cuando corresponda y el borrado transaccional para supresión autorizada. Revisar las excepciones de conservación y la obligación de informar: borrar no siempre es la respuesta jurídica aplicable.

La baja de una cuenta profesional y la devolución/eliminación de todos sus perfiles deben gestionarse también. Esta entrega no introduce una baja automática de Auth ni elimina facturas/obligaciones fiscales. Inventariar antes registros de cuenta, pagos, perfiles, auditoría y copias, y probar el proceso administrativo completo.

## Incidentes

Designar una persona responsable, limitar accesos afectados, preservar evidencias mínimas y determinar alcance, categorías y posibles afectados. Coordinar avisos al responsable y las obligaciones ante la autoridad/interesados cuando procedan. Documentar decisión y tiempos; no asumir que todo incidente requiere la misma notificación ni que usar alias elimina el riesgo.

## Conservación

Acordar y documentar plazos por finalidad, revisión de perfiles inactivos y rotación real de copias/logs en cada proveedor. La fecha de revisión del perfil no borra automáticamente. Programar y comprobar la purga de auditoría técnica de 30 días propuesta en esta implementación. Evaluar necesidad/proporcionalidad de ese plazo; no se presenta como un mandato del RGPD.

## Lista previa a uso comercial

- Identidad/contacto e información pública completa del prestador; condiciones del servicio y contrato de encargo revisados.
- Finalidades, legitimación y tratamiento de menores/salud definidos; evaluación de necesidad de EIPD documentada.
- Contratos, regiones, transferencias, retención y subencargados de proveedores verificados en sus paneles/acuerdos reales.
- MFA para administración de Supabase, Cloudflare, Stripe y repositorio; cuentas individuales para administración y permisos mínimos.
- Simulación de acceso, borrado, restauración, baja de cuenta e incidente completada.
- Pruebas de aislamiento con al menos dos cuentas reales de prueba tras aplicar la migración, sin datos de menores.
