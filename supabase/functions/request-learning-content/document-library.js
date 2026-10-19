(function(root){
'use strict';
const text=value=>({type:'text',text:value}),table=rows=>({type:'table',header:true,rows});
const documents={
 'invoice-co-v1':{title:'Factura de Papelería Norte',kind:'Factura',country:'Colombia',width:1024,height:1536,path:'assets/documents/invoice-co-v1.png',
  transcript:[text('FACTURA · Papelería Norte · F-1048. Fecha: 14/10/2026. Moneda: pesos colombianos (COP).'),table([['Producto','Cantidad','Precio unitario','Importe'],['Cuadernos','2','6.000','12.000'],['Carpetas','3','2.000','6.000'],['Lápices','4','1.000','4.000']]),text('Subtotal: 22.000. Entrega: 3.000. TOTAL: 25.000. Pagar antes del 20/10/2026. Documento ficticio para practicar.')],
  facts:{subtotal:22000,delivery:3000,total:25000,issued:'14/10/2026',due:'20/10/2026'},
  questions:[['¿Cuál es el total que debe pagarse?','25.000 COP',['22.000 COP','3.000 COP','12.000 COP']],['¿Cuánto cuestan los dos cuadernos juntos?','12.000 COP',['6.000 COP','22.000 COP','25.000 COP']],['¿Qué dato falta en un plan que solo reserva 22.000 COP para pagar toda la factura?','Los 3.000 COP de entrega',['Los 12.000 COP de cuadernos','Los 6.000 COP de carpetas','Los 4.000 COP de lápices']]]},
 'receipt-co-v1':{title:'Recibo de Tienda Barrio Verde',kind:'Recibo de compra',country:'Colombia',width:1024,height:1536,path:'assets/documents/receipt-co-v1.png',
  transcript:[text('Tienda Barrio Verde · RECIBO DE COMPRA · R-0312 · 15/10/2026 · 10:35. Moneda: pesos colombianos (COP).'),table([['Producto','Cantidad','Importe'],['Pan','1','5.000'],['Leche','2','8.000'],['Manzanas','1','6.000']]),text('TOTAL: 19.000. Pagado: 20.000. Cambio: 1.000. Gracias por tu visita. Documento ficticio para practicar.')],
  facts:{total:19000,paid:20000,change:1000,milkCount:2,milkAmount:8000},
  questions:[['¿Cuánto dinero se entregó para pagar?','20.000 COP',['19.000 COP','1.000 COP','8.000 COP']],['¿Qué cantidad corresponde al importe de las dos unidades de leche?','8.000 COP',['4.000 COP','19.000 COP','2.000 COP']],['Al revisar el pago, alguien dice que deben devolver 2.000 COP. ¿Qué corrección corresponde?','El cambio es 1.000 COP: se pagaron 20.000 y el total es 19.000',['El cambio es 2.000 COP porque se compraron dos unidades de leche','No hay cambio porque el total es 20.000 COP','El cambio es 8.000 COP, igual al importe de la leche']]]},
 'catalogue-co-v1':{title:'Catálogo escolar de Papelería Norte',kind:'Catálogo',country:'Colombia',width:1024,height:1536,path:'assets/documents/catalogue-co-v1.png',
  transcript:[text('CATÁLOGO ESCOLAR · Papelería Norte. Moneda: pesos colombianos (COP). Válido hasta el 31/10/2026.'),table([['Producto','Precio'],['Cuaderno azul','6.000'],['Carpeta verde','2.000'],['Lápiz','1.000'],['Cartuchera','8.000']]),text('Paquete A: cuaderno + carpeta · 7.000. Paquete B: cartuchera + lápiz · 8.500. Recogida en tienda: sin cargo. Documento ficticio para practicar.')],
  facts:{notebook:6000,folder:2000,pencil:1000,pencilCase:8000,packageA:7000,packageB:8500,validUntil:'31/10/2026'},
  questions:[['¿Qué producto tiene un precio de 8.000 COP?','La cartuchera',['El cuaderno azul','La carpeta verde','El lápiz']],['Necesitas un cuaderno y una carpeta. ¿Qué opción tiene menor precio?','El paquete A por 7.000 COP',['Los dos productos por separado por 8.000 COP','El paquete B por 8.500 COP','La cartuchera por 8.000 COP']],['El plan propone comprar el paquete B para conseguir un cuaderno y una carpeta. ¿Qué debe corregirse?','Elegir el paquete A, que incluye los dos productos necesarios',['Añadir otro lápiz al paquete B','Comprar solo la cartuchera','Cambiar el paquete B por un lápiz suelto']]]},
 'brochure-co-v1':{title:'Folleto del taller de dibujo',kind:'Folleto',country:'Colombia',width:1024,height:1536,path:'assets/documents/brochure-co-v1.png',
  transcript:[text('TALLER DE DIBUJO · Centro Cultural La Plaza. Sábado 24/10/2026. De 10:00 a 12:00.'),table([['Dato','Condición'],['Edad','De 12 a 18 años'],['Inscripción','Hasta el 22/10/2026'],['Materiales','Incluidos'],['Precio','Actividad gratuita'],['Llegada','15 minutos antes'],['Para entrar','Trae tu confirmación de inscripción']]),text('Documento ficticio para practicar.')],
  facts:{date:'24/10/2026',registration:'22/10/2026',start:'10:00',finish:'12:00',earlyMinutes:15,minAge:12,maxAge:18},
  questions:[['¿Hasta qué fecha se puede hacer la inscripción?','22/10/2026',['24/10/2026','31/10/2026','20/10/2026']],['Si el taller empieza a las 10:00 y pide llegar quince minutos antes, ¿a qué hora debes estar allí?','09:45',['10:00','10:15','09:15']],['El plan propone inscribirse el 23/10 y llegar a las 10:00 del día del taller. ¿Qué dos cambios hacen falta?','Inscribirse como máximo el 22/10 y llegar a las 09:45',['Inscribirse el 24/10 y llegar a las 09:45','Inscribirse el 22/10 y llegar a las 10:00','Inscribirse el 23/10 y llegar a las 09:45']]]}
};
const authoredDocuments=[
  [
    "poster-mx",
    "Cartel de cine en el patio",
    "Cartel",
    "México",
    [
      "CINE EN EL PATIO · Centro Juvenil Nube · Ciudad de México",
      "Viernes 23/10/2026 · Entrada a las 17:30 · Película a las 18:00",
      "Entrada gratuita. Trae una manta. Si llueve, la proyección pasa al salón 2."
    ],
    [
      [
        "¿A qué hora empieza la película?",
        "18:00",
        [
          "17:30",
          "19:00",
          "16:30"
        ]
      ],
      [
        "Si llueve, ¿qué cambia?",
        "El lugar de la proyección",
        [
          "El día",
          "El precio",
          "La película"
        ]
      ],
      [
        "¿Para qué se publica este cartel?",
        "Para invitar y explicar cómo asistir",
        [
          "Para resumir la película",
          "Para vender mantas",
          "Para anunciar una cancelación"
        ]
      ]
    ],
    "Escribe un mensaje de 3–4 frases a una amiga para invitarla. Incluye hora, qué llevar y el plan si llueve.",
    "Te invito al cine del viernes. La película empieza a las 18:00. Lleva una manta; si llueve, iremos al salón 2."
  ],
  [
    "ticket-es",
    "Entrada del museo de ciencia",
    "Entrada",
    "España",
    [
      "MUSEO ABIERTO · Valencia · Entrada de práctica",
      "Domingo 25/10/2026 · Acceso: 11:00 · Sala: Inventos",
      "Esta entrada permite una visita. El taller de robots requiere reserva aparte."
    ],
    [
      [
        "¿A qué sala da acceso la entrada?",
        "Inventos",
        [
          "Robots",
          "Cine",
          "Biblioteca"
        ]
      ],
      [
        "¿Basta esta entrada para participar en el taller?",
        "No; el taller requiere otra reserva",
        [
          "Sí; permite todas las actividades",
          "Solo después de las 12:00",
          "Solo si llueve"
        ]
      ],
      [
        "¿Qué información conviene comprobar antes de salir?",
        "La fecha y la hora de acceso",
        [
          "El color del museo",
          "La duración de una película",
          "La marca del teléfono"
        ]
      ]
    ],
    "Redacta un correo de 4–5 frases al museo: quieres ir también al taller. Explica qué entrada tienes y pregunta cómo reservar.",
    "Tengo una entrada para Inventos el 25/10 a las 11:00. Quisiera asistir también al taller de robots. ¿Cómo puedo reservar una plaza?"
  ],
  [
    "menu-ar",
    "Menú del recreo",
    "Menú",
    "Argentina",
    [
      "CAFÉ DEL PATIO · Rosario · Precios en pesos argentinos (ARS)",
      "Sándwich de queso: 2.400 ARS · Ensalada: 3.200 ARS",
      "Agua: 900 ARS · Combo sándwich + agua: 3.000 ARS",
      "El combo no incluye postre. Consulta los ingredientes antes de pedir si tienes alergias."
    ],
    [
      [
        "¿Cuánto cuesta la ensalada?",
        "3.200 ARS",
        [
          "2.400 ARS",
          "900 ARS",
          "3.000 ARS"
        ]
      ],
      [
        "¿Qué incluye el combo?",
        "Un sándwich y agua",
        [
          "Ensalada y postre",
          "Sándwich y postre",
          "Solo agua"
        ]
      ],
      [
        "¿Qué debe hacer quien tiene una alergia?",
        "Consultar los ingredientes antes de pedir",
        [
          "Pedir el combo sin preguntar",
          "Suponer que todos los platos son iguales",
          "Consultar después de comer"
        ]
      ]
    ],
    "Escribe una respuesta de 3–4 frases a alguien que dice que el combo trae postre. Corrige la información con una prueba del menú.",
    "El combo incluye sándwich y agua por 3.000 ARS. El menú aclara que no incluye postre. Conviene leer esa condición antes de pedir."
  ],
  [
    "notice-cl",
    "Aviso de biblioteca",
    "Aviso escolar",
    "Chile",
    [
      "BIBLIOTECA DEL CENTRO · Valparaíso",
      "Del lunes 26 al miércoles 28/10/2026 la sala de lectura estará cerrada por reparación.",
      "El préstamo seguirá abierto de 09:00 a 13:00 en la entrada norte. Las devoluciones podrán hacerse en el buzón."
    ],
    [
      [
        "¿Dónde se atienden los préstamos?",
        "En la entrada norte",
        [
          "En la sala cerrada",
          "En el patio",
          "En el buzón"
        ]
      ],
      [
        "¿Se puede devolver un libro mientras la sala está cerrada?",
        "Sí, en el buzón",
        [
          "No, hasta el jueves",
          "Solo a las 18:00",
          "Solo con una reserva"
        ]
      ],
      [
        "¿Qué titular resume el aviso sin exagerarlo?",
        "Cierra la sala, pero continúan préstamo y devoluciones",
        [
          "Cierra toda la biblioteca",
          "No se admiten devoluciones",
          "El centro suspende todas las clases"
        ]
      ]
    ],
    "Reescribe «La biblioteca cierra y no se pueden devolver libros» para el grupo de clase. Usa dos datos del aviso y no añadas información.",
    "La sala de lectura cierra del 26 al 28. Los préstamos continúan en la entrada norte de 09:00 a 13:00 y se pueden devolver libros en el buzón."
  ],
  [
    "transport-co",
    "Cambio de parada",
    "Transporte",
    "Colombia",
    [
      "RUTA JOVEN · Bogotá · Aviso del 20/10/2026",
      "El sábado 24 la parada Parque se traslada a Biblioteca por obras.",
      "Línea A: Centro 16:20 · Biblioteca 16:50 · Terminal 17:10",
      "El cambio solo afecta al sábado 24. No cambia la tarifa."
    ],
    [
      [
        "¿Dónde para la línea A a las 16:50?",
        "Biblioteca",
        [
          "Parque",
          "Centro",
          "Terminal"
        ]
      ],
      [
        "¿Se aplica el aviso el domingo 25?",
        "El aviso solo indica el sábado 24",
        [
          "Sí, todo el mes",
          "Sí, todos los domingos",
          "Solo por la mañana"
        ]
      ],
      [
        "¿Qué dato evita esperar en el lugar equivocado?",
        "El traslado de Parque a Biblioteca",
        [
          "El color del autobús",
          "El nombre del conductor",
          "El precio de un libro"
        ]
      ]
    ],
    "Escribe un mensaje breve a un compañero que piensa esperar en Parque el sábado. Explica la nueva parada y la hora sin generalizar el cambio a toda la semana.",
    "El sábado 24 debes esperar en Biblioteca, no en Parque. La línea A pasa allí a las 16:50. El aviso solo afecta a ese sábado."
  ],
  [
    "infographic-cr",
    "Agua en la escuela",
    "Infografía",
    "Costa Rica",
    [
      "AGUA EN NUESTRA ESCUELA · San José · Recuento de una semana",
      "Se revisaron 20 grifos: 15 cerraban bien y 5 tenían fugas.",
      "El equipo reparó 4 de los 5 grifos con fugas. Queda uno pendiente.",
      "Los datos describen esta escuela durante esa semana. No representan a todas las escuelas."
    ],
    [
      [
        "¿Cuántos grifos tenían fugas?",
        "5",
        [
          "20",
          "15",
          "4"
        ]
      ],
      [
        "Después de las reparaciones, ¿cuántos siguen pendientes?",
        "1",
        [
          "4",
          "5",
          "15"
        ]
      ],
      [
        "¿Qué frase respeta el alcance de los datos?",
        "En esta escuela se detectaron cinco fugas esa semana",
        [
          "Todas las escuelas tienen cinco fugas",
          "Ya no queda ninguna fuga",
          "Todos los grifos estaban dañados"
        ]
      ]
    ],
    "Escribe un pie de infografía de 35–50 palabras para la web escolar. Incluye el resultado, lo pendiente y el límite de los datos.",
    "Durante una semana se revisaron veinte grifos de nuestra escuela. Cinco tenían fugas y cuatro ya se repararon. Queda uno pendiente. Este recuento describe nuestro centro y esa semana; no permite concluir cómo están los grifos de otras escuelas."
  ],
  [
    "post-pa",
    "Publicación del club de intercambio",
    "Publicación social",
    "Panamá",
    [
      "CLUB REUSA · Ciudad de Panamá · Publicación del 19/10/2026",
      "Intercambio de libros: sábado 24, de 10:00 a 12:00, en el patio.",
      "Trae hasta tres libros en buen estado. Participar no garantiza encontrar un título concreto.",
      "Comentario de una usuaria: «Seguro que será la mejor actividad del año»."
    ],
    [
      [
        "¿Cuántos libros se pueden llevar como máximo?",
        "3",
        [
          "1",
          "10",
          "12"
        ]
      ],
      [
        "¿Está garantizado conseguir el libro que buscas?",
        "No; depende de lo que se lleve",
        [
          "Sí, cualquier título",
          "Solo llevando un libro",
          "Solo llegando al final"
        ]
      ],
      [
        "¿Qué parte es una opinión?",
        "«Será la mejor actividad del año»",
        [
          "El sábado 24",
          "De 10:00 a 12:00",
          "Hasta tres libros"
        ]
      ]
    ],
    "Redacta 4–5 frases para el boletín: distingue un hecho del anuncio, una inferencia razonable y la opinión del comentario. Señala cuál es cada una.",
    "Hecho: el intercambio será el sábado de 10:00 a 12:00. Inferencia: habrá títulos diferentes según los libros que lleven las personas. Opinión: decir que será la mejor actividad del año expresa una valoración que aún no se ha comprobado."
  ],
  [
    "label-mx",
    "Etiqueta de bebida",
    "Etiqueta",
    "México",
    [
      "BEBIDA DE AVENA · Envase de práctica · Guadalajara",
      "Contenido: 250 ml · Ingredientes: agua, avena y cacao.",
      "Contiene avena. Puede contener trazas de leche.",
      "Agitar antes de abrir. Una vez abierta, conservar refrigerada y consumir en 24 horas."
    ],
    [
      [
        "¿Cuánto contiene el envase?",
        "250 ml",
        [
          "24 ml",
          "500 ml",
          "100 ml"
        ]
      ],
      [
        "¿Qué hay que hacer después de abrirlo?",
        "Refrigerarlo y consumirlo en 24 horas",
        [
          "Dejarlo al sol",
          "Guardarlo abierto una semana",
          "Agitarlo sin refrigerar"
        ]
      ],
      [
        "¿Qué dato interesa especialmente a alguien con alergia a la leche?",
        "Puede contener trazas de leche",
        [
          "El lugar de fabricación",
          "El color del envase",
          "La cantidad de cacao no indicada"
        ]
      ]
    ],
    "Escribe instrucciones de dos pasos para quien acaba de abrir la bebida. Mantén las condiciones y el plazo exactos.",
    "1. Guarda la bebida abierta en el refrigerador. 2. Consúmela dentro de las siguientes 24 horas."
  ],
  [
    "form-es",
    "Solicitud de préstamo de cámara",
    "Formulario",
    "España",
    [
      "CENTRO JOVEN · Sevilla · Solicitud de cámara",
      "Datos obligatorios: nombre, fecha de recogida, fecha de devolución y firma.",
      "Ejemplo: Alex Ruiz · Recogida: 26/10/2026 · Devolución: sin completar · Firma: Alex Ruiz",
      "Guardar borrador no envía la solicitud. Al enviarla se genera un comprobante."
    ],
    [
      [
        "¿Qué dato obligatorio falta en el ejemplo?",
        "La fecha de devolución",
        [
          "El nombre",
          "La firma",
          "La fecha de recogida"
        ]
      ],
      [
        "¿Guardar el borrador completa la entrega?",
        "No; hay que enviarlo y obtener el comprobante",
        [
          "Sí, siempre",
          "Solo si tiene firma",
          "Solo por la mañana"
        ]
      ],
      [
        "¿Qué diferencia hay entre borrador y solicitud enviada?",
        "Solo el envío genera comprobante",
        [
          "El borrador se recoge en persona",
          "El envío elimina el nombre",
          "No hay ninguna diferencia"
        ]
      ]
    ],
    "Redacta un correo breve al equipo para explicar por qué la solicitud aún no está lista y qué dos pasos faltan.",
    "La solicitud todavía no está lista: falta la fecha de devolución. Después de completarla, hay que enviarla y guardar el comprobante. Guardar el borrador no equivale a entregarla."
  ],
  [
    "map-cl",
    "Plano del centro cultural",
    "Plano",
    "Chile",
    [
      "CENTRO CULTURAL · Concepción · Plano esquemático",
      "Entrada → Patio → Biblioteca",
      "Desde el patio: a la izquierda, Taller; a la derecha, Sala de música.",
      "La biblioteca tiene acceso sin escalones desde el patio. El taller solo se alcanza por una escalera."
    ],
    [
      [
        "¿Qué espacio está entre la entrada y la biblioteca?",
        "El patio",
        [
          "El taller",
          "La sala de música",
          "La calle"
        ]
      ],
      [
        "¿Qué destino tiene acceso sin escalones desde el patio?",
        "La biblioteca",
        [
          "El taller",
          "Todos los espacios",
          "La escalera"
        ]
      ],
      [
        "¿Qué indicación lleva del patio al taller?",
        "Ir a la izquierda y subir la escalera",
        [
          "Ir a la derecha",
          "Salir a la calle",
          "Atravesar la biblioteca"
        ]
      ]
    ],
    "Escribe indicaciones claras para una visitante que entra y quiere llegar a la biblioteca sin escaleras. Usa solo los datos del plano.",
    "Desde la entrada, avanza hasta el patio. Sigue hacia la biblioteca. Ese acceso no tiene escalones."
  ],
  [
    "schedule-ar",
    "Horario de talleres",
    "Horario",
    "Argentina",
    [
      "CENTRO ABIERTO · Córdoba · Sábado 24/10/2026",
      "Fotografía: 10:00–11:00 · Aula 1",
      "Música: 10:30–11:30 · Aula 2",
      "Dibujo: 11:15–12:15 · Aula 1",
      "Para asistir a un taller completo debes estar desde el inicio hasta el final."
    ],
    [
      [
        "¿En qué aula se hace Música?",
        "Aula 2",
        [
          "Aula 1",
          "Patio",
          "Biblioteca"
        ]
      ],
      [
        "¿Qué dos talleres puedes hacer completos sin solapamiento?",
        "Fotografía y Dibujo",
        [
          "Fotografía y Música",
          "Música y Dibujo",
          "Los tres"
        ]
      ],
      [
        "¿Por qué no se pueden completar Música y Dibujo?",
        "Coinciden entre las 11:15 y las 11:30",
        [
          "Son en la misma aula",
          "Empiezan a la misma hora",
          "Uno no tiene hora de fin"
        ]
      ]
    ],
    "Escribe una recomendación de 4–5 frases para quien quiere hacer dos talleres completos. Apóyala en las horas y explica una combinación que no sirve.",
    "Recomiendo Fotografía y Dibujo. Fotografía termina a las 11:00 y Dibujo comienza a las 11:15, así que no coinciden. Música y Dibujo se solapan de 11:15 a 11:30 y no permiten asistir a ambos completos."
  ],
  [
    "advert-co",
    "Anuncio de datos móviles",
    "Anuncio",
    "Colombia",
    [
      "CONECTA JOVEN · Bogotá · Precios en pesos colombianos (COP)",
      "Plan de 30 días: 20.000 COP · Incluye 4 GB.",
      "Titular publicitario: «¡Navega sin límites!»",
      "Después de 4 GB se reduce la velocidad. No incluye llamadas. La renovación es manual."
    ],
    [
      [
        "¿Cuántos datos incluye a la velocidad inicial?",
        "4 GB",
        [
          "30 GB",
          "20 GB",
          "Sin límite"
        ]
      ],
      [
        "¿Qué ocurre al consumir los 4 GB?",
        "Se reduce la velocidad",
        [
          "Se renueva automáticamente",
          "Se incluyen llamadas",
          "Se cancela el teléfono"
        ]
      ],
      [
        "¿Qué contradicción debe aclararse en el titular?",
        "«Sin límites» omite la reducción tras 4 GB",
        [
          "El plan dura treinta días",
          "La renovación es manual",
          "El precio aparece en COP"
        ]
      ]
    ],
    "Reescribe el anuncio para informar a estudiantes sin exagerar. Conserva precio, duración, datos y condición de velocidad.",
    "Por 20.000 COP tienes un plan de treinta días con 4 GB a la velocidad inicial. Después se reduce la velocidad. No incluye llamadas y la renovación es manual."
  ],
  [
    "instructions-cr",
    "Cómo entregar un audio",
    "Instrucciones",
    "Costa Rica",
    [
      "RADIO ESCOLAR · Heredia · Entrega de una entrevista",
      "1. Graba la entrevista con permiso de la persona.",
      "2. Escucha el audio y comprueba que se entiende.",
      "3. Exporta un archivo MP3 de hasta 10 MB.",
      "4. Envía el MP3 y guarda el comprobante. No se aceptan enlaces privados."
    ],
    [
      [
        "¿Qué formato se pide?",
        "MP3",
        [
          "PDF",
          "JPG",
          "DOCX"
        ]
      ],
      [
        "¿Sirve enviar un enlace privado en lugar del archivo?",
        "No; se pide el MP3",
        [
          "Sí, siempre",
          "Solo si es largo",
          "Solo después de escucharlo"
        ]
      ],
      [
        "¿Qué paso comprueba la calidad antes de entregar?",
        "Escuchar el audio y revisar que se entiende",
        [
          "Guardar el comprobante",
          "Cambiar el nombre de la clase",
          "Enviar un enlace privado"
        ]
      ]
    ],
    "Reescribe «Graba y mándalo como sea» como una guía de cuatro pasos para tu clase. Incluye permiso, revisión, formato y comprobante.",
    "Pide permiso y graba la entrevista. Escucha el audio para comprobar que se entiende. Exporta un MP3 de hasta 10 MB. Envía el archivo y guarda el comprobante."
  ],
  [
    "news-pa",
    "Dos fuentes sobre el patio",
    "Noticia y comparación",
    "Panamá",
    [
      "BOLETÍN DEL CENTRO · Ciudad de Panamá · 19/10/2026",
      "Fuente A · Consejo de estudiantes: respondieron 40 personas y 30 pidieron más sombra.",
      "Fuente B · Registro del centro: hay 160 estudiantes; se instalaron dos toldos la semana pasada.",
      "Ninguna fuente mide aún si los toldos cubren la zona solicitada."
    ],
    [
      [
        "¿Cuántas personas respondieron a la consulta?",
        "40",
        [
          "30",
          "160",
          "2"
        ]
      ],
      [
        "¿Qué no permiten afirmar todavía las dos fuentes?",
        "Que la sombra ya cubre la zona solicitada",
        [
          "Que se instalaron dos toldos",
          "Que treinta personas pidieron sombra",
          "Que hay ciento sesenta estudiantes"
        ]
      ],
      [
        "¿Qué aporta la fuente B que no aporta la A?",
        "La instalación de dos toldos",
        [
          "La preferencia de treinta participantes",
          "La cantidad de respuestas",
          "Una medida de la sombra actual"
        ]
      ]
    ],
    "Escribe una nota de 45–65 palabras para el boletín. Relaciona ambas fuentes, atribuye cada dato y explica qué falta comprobar.",
    "Según el consejo de estudiantes, treinta de las cuarenta personas que respondieron pidieron más sombra. El registro del centro indica que se instalaron dos toldos. Son datos distintos y complementarios. Todavía falta comprobar si los toldos cubren la zona que se solicitó; ninguna de las fuentes lo mide."
  ]
];
for(const [id,title,kind,country,lines,questions,brief,sample] of authoredDocuments){
 documents[id]={title,kind,country,width:1024,height:1536,path:`assets/documents/${id}.png`,transcript:[...lines.map(text),text('Documento ficticio para practicar.')],questions,brief,sample,minAge:['news-pa','advert-co','form-es'].includes(id)?'middle':'junior'};
}
// Executive tasks ask the learner to apply conditions and review a proposed plan.
// Attention and literacy retain locating and interpreting source information.
const executiveQuestions={
 'invoice-co-v1':[
 ['Debes pagar toda la factura. El plan reserva solo el subtotal y olvida la entrega. ¿Qué cantidad debes reservar?', '25.000 COP', ['22.000 COP','3.000 COP','12.000 COP']],
 ['Una persona reserva 25.000 COP, pero cree que los cuadernos cuestan 6.000 COP en total. ¿Qué dato debe corregir antes de registrar el gasto?', 'Los dos cuadernos cuestan 12.000 COP en total', ['El total de la factura debe cambiarse a 22.000 COP','La entrega no tiene ningún cargo','Las carpetas cuestan 2.000 COP en total']],
 documents['invoice-co-v1'].questions[2]],
 'receipt-co-v1':[
 ['Pagaste con 20.000 COP. Antes de guardar el recibo debes comprobar el cambio. ¿Qué cantidad debe coincidir?', '1.000 COP', ['2.000 COP','8.000 COP','19.000 COP']],
 ['En tu registro anotaste 20.000 COP como gasto final de esta compra. Al revisar el recibo ves que hubo cambio. ¿Cómo corriges el registro?', 'Registrar 19.000 COP de gasto y 1.000 COP de cambio', ['Registrar 20.000 COP de gasto y ningún cambio','Registrar 18.000 COP de gasto y 2.000 COP de cambio','Registrar 8.000 COP de gasto y 12.000 COP de cambio']],
 documents['receipt-co-v1'].questions[2]],
 'catalogue-co-v1':[
 ['Necesitas un cuaderno y una carpeta. El presupuesto es de 7.000 COP. ¿Qué compra cumple las dos condiciones?', 'El paquete A', ['El paquete B','Solo el cuaderno azul','Los dos productos por separado']],
 ['El plan compra un cuaderno y una carpeta por separado por 8.000 COP. Debes conseguir ambos por el menor precio. ¿Qué cambio haces?', 'Comprar el paquete A por 7.000 COP', ['Comprar el paquete B por 8.500 COP','Comprar solo la carpeta por 2.000 COP','Comprar una cartuchera por 8.000 COP']],
 documents['catalogue-co-v1'].questions[2]],
 'brochure-co-v1':[
 ['Tienes 16 años y quieres asistir al taller. Antes de la fecha límite debes hacer un trámite. ¿Qué paso incluyes primero?', 'Hacer la inscripción como máximo el 22/10/2026', ['Presentarte sin inscripción el 24/10/2026','Pagar materiales que el taller ya incluye','Esperar al 31/10/2026 para inscribirte']],
 ['Ya estás inscrito. El plan es llegar al taller a las 10:00 sin llevar nada. ¿Qué dos detalles debes revisar?', 'Llegar a las 09:45 y llevar la confirmación', ['Llegar a las 10:15 y pagar materiales','Llegar a las 12:00 y llevar la confirmación','Llegar a las 10:00 y volver a inscribirte']],
 documents['brochure-co-v1'].questions[2]]
};
Object.assign(executiveQuestions,{
  "notice-cl": [
    [
      "El plan dice que no se puede pedir un libro porque la sala está cerrada. ¿Qué corrección permite hacerlo durante esos días?",
      "Ir al préstamo en la entrada norte de 09:00 a 13:00",
      [
        "Esperar dentro de la sala cerrada",
        "Ir a la entrada norte a las 18:00",
        "Usar el buzón para pedir un libro"
      ]
    ],
    [
      "Debes devolver un libro el martes 27. El plan propone esperar a que abra la sala. ¿Qué opción permite cumplir la devolución ese día?",
      "Depositar el libro en el buzón de devoluciones",
      [
        "Entrar en la sala cerrada",
        "Guardar el libro hasta el jueves",
        "Dejarlo en cualquier aula"
      ]
    ],
    [
      "Revisas un mensaje que dice «Del 26 al 28 no funciona ningún servicio de biblioteca». ¿Qué debes corregir antes de enviarlo?",
      "Solo cierra la sala; continúan el préstamo en la entrada norte y las devoluciones en el buzón",
      [
        "Todos los servicios abren hasta las 18:00",
        "El buzón también está cerrado",
        "El préstamo se hace dentro de la sala cerrada"
      ]
    ]
  ],
  "schedule-ar": [
    [
      "Quieres completar dos talleres. ¿Qué plan no tiene horas superpuestas?",
      "Fotografía y Dibujo",
      [
        "Fotografía y Música",
        "Música y Dibujo",
        "Los tres talleres completos"
      ]
    ],
    [
      "El plan reserva Música y Dibujo completos. Antes de confirmarlo revisas el horario. ¿Qué error debes señalar?",
      "Se superponen de 11:15 a 11:30",
      [
        "Los dos son en el aula 2",
        "Dibujo empieza antes que Música",
        "Fotografía termina a las 12:15"
      ]
    ],
    [
      "Una persona propone salir de Música a las 11:15 para llegar a Dibujo y cuenta ambos como completos. ¿Cumple la condición del documento?",
      "No; dejaría Música quince minutos antes de su final",
      [
        "Sí; basta con llegar al inicio de Dibujo",
        "Sí; las aulas son diferentes",
        "No; Dibujo ya habría terminado"
      ]
    ]
  ],
  "instructions-cr": [
    [
      "El plan comienza grabando a una persona sin preguntarle. ¿Qué paso debe ir antes?",
      "Obtener su permiso",
      [
        "Guardar el comprobante",
        "Exportar el archivo final",
        "Publicar el enlace privado"
      ]
    ],
    [
      "Ya tienes permiso y has grabado. El plan pasa directamente al envío sin revisar el sonido. ¿Qué paso falta?",
      "Escuchar el audio y comprobar que se entiende",
      [
        "Cambiar MP3 por un documento PDF",
        "Eliminar la grabación sin escucharla",
        "Enviar únicamente un enlace privado"
      ]
    ],
    [
      "El plan entrega un enlace privado a un archivo de 15 MB. ¿Qué dos cambios cumplen las instrucciones?",
      "Enviar el archivo MP3 y reducirlo a 10 MB como máximo",
      [
        "Enviar el enlace privado y mantener 15 MB",
        "Enviar un PDF de 10 MB",
        "Enviar el MP3 de 15 MB sin enlace"
      ]
    ]
  ],
  "form-es": [
    [
      "El plan considera completo el ejemplo de solicitud. ¿Qué dato debe completarse antes de enviarlo?",
      "La fecha de devolución",
      [
        "Un segundo nombre",
        "La hora del taller de robots",
        "El precio de un libro"
      ]
    ],
    [
      "Ya completaste todos los campos. El plan termina al guardar el borrador. ¿Qué falta para acreditar la entrega?",
      "Enviar la solicitud y guardar el comprobante",
      [
        "Guardar de nuevo el borrador",
        "Borrar la firma",
        "Cambiar la fecha sin enviar"
      ]
    ],
    [
      "Una persona afirma que el borrador guardado prueba que la solicitud está entregada, aunque falta la fecha de devolución. ¿Qué debe exigir la supervisión?",
      "Completar la fecha, enviar y obtener el comprobante",
      [
        "Solo guardar otra copia del borrador",
        "Solo añadir la fecha sin enviar",
        "Entregar la cámara sin completar la solicitud"
      ]
    ]
  ]
});
const attentionAdvanced={
 'invoice-co-v1':['¿Qué combinación coincide con el subtotal y la entrega, en ese orden?','22.000 COP y 3.000 COP',['25.000 COP y 3.000 COP','22.000 COP y 6.000 COP','12.000 COP y 4.000 COP']],
 'receipt-co-v1':['¿Qué combinación coincide con el total y el cambio, en ese orden?','19.000 COP y 1.000 COP',['20.000 COP y 1.000 COP','19.000 COP y 2.000 COP','8.000 COP y 6.000 COP']],
 'catalogue-co-v1':['¿Qué combinación coincide con el precio del paquete B y su contenido?','8.500 COP: cartuchera y lápiz',['7.000 COP: cartuchera y lápiz','8.500 COP: cuaderno y carpeta','8.000 COP: cuaderno y lápiz']],
 'brochure-co-v1':['¿Qué combinación coincide con la fecha límite de inscripción y el horario del taller?','22/10/2026 y de 10:00 a 12:00',['24/10/2026 y de 10:00 a 12:00','22/10/2026 y de 09:45 a 12:00','31/10/2026 y de 10:00 a 12:00']]
};
function get(id){return documents[id]||null;}
function supports(age,domain){return ['junior','primary','middle','teen'].includes(age)&&['attention','executive','literacy','reading','middleReading'].includes(domain)&&!(age==='junior'&&domain==='literacy');}
function pool(age,domain,level=1){
 if(!supports(age,domain))return [];
 const source=Object.keys(documents).filter(id=>domain!=='executive'||Object.hasOwn(executiveQuestions,id)).filter(id=>!documents[id].minAge?age!=='junior'||id==='catalogue-co-v1':['early','junior','primary','middle','teen'].indexOf(age)>=['early','junior','primary','middle','teen'].indexOf(documents[id].minAge));
 return source.map(id=>{
  const doc=get(id),tuple=domain==='executive'?(executiveQuestions[id]||doc.questions)[level-1]:domain==='attention'&&level===3?(attentionAdvanced[id]||doc.questions[2]):doc.questions[level-1],q=tuple[0],a=tuple[1],opts=[a,...tuple[2]];
  return {id:`document-${age}-${domain}-${level}-${id}`,contentKey:`document-v1:${age}:${domain}:${level}:${id}`,passageKey:`document:${id}`,domain,level,
   type:'standard',responseType:'choice',requiresStimulus:true,currencyContext:'foreign',topic:doc.kind+' · interpretar un documento',
   stimulus:[text(`Documento ficticio de ${doc.country}. ${['invoice-co-v1','receipt-co-v1','catalogue-co-v1'].includes(id)?'Los importes están en pesos colombianos (COP).':''}`),{type:'document',documentId:id}],q,a,opts,
   why:a+'. Comprueba los datos directamente en el documento.',mechanic:`document_${domain}_${doc.kind.replace(/\s/g,'_')}_${level}`,
   ...(age==='junior'?{juniorProfile:{route:age,level}}:{}),...(['primary','middle'].includes(age)?{schoolProfile:{route:age,level}}:{})};
 });
}
function generate(age,domain,level){const bank=pool(age,domain,level);return bank[Math.floor(Math.random()*bank.length)]||null;}
const api={documents,get,supports,pool,generate};root.DocumentLibrary=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
