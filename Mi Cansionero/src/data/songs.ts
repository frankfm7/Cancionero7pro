import { Hymnal, Song } from '../types';

export const hymnals: Hymnal[] = [
  {
    id: 'alabanzas',
    name: 'Alabanzas',
    description: 'Canciones juveniles en castellano',
    language: 'Castellano',
    icon: '🎵',
    color: '#a855f7', // Más vibrante
    isCustom: false,
    codePrefix: 'A',
  },
  {
    id: 'bautista',
    name: 'Himnario Bautista',
    description: 'Himnos tradicionales',
    language: 'Castellano',
    icon: '⛪',
    color: '#3b82f6', // Más brillante
    isCustom: false,
    codePrefix: 'B',
  },
  {
    id: 'cala',
    name: 'Himnario Cala',
    description: 'Bilingüe: Aymara / Castellano',
    language: 'Aymara/Castellano',
    icon: '🏔️',
    color: '#10b981', // Verde fosforescente
    isCustom: false,
    codePrefix: 'C',
  },
  {
    id: 'quechua',
    name: 'Himnario Quechua',
    description: 'Himnos en Quechua',
    language: 'Quechua',
    icon: '🌿',
    color: '#22c55e', // Verde más vivo
    isCustom: false,
    codePrefix: 'Q',
  },
  {
    id: 'mis-canciones',
    name: 'Mis Canciones',
    description: 'Creaciones personales',
    language: 'Castellano',
    icon: '✍️',
    color: '#f97316', // Naranja vibrante
    isCustom: true,
    codePrefix: 'M',
  },
];

export const songs: Song[] = [
  // ALABANZAS (Juveniles)
  {
    id: 'a1',
    title: 'Grande es el Señor',
    artist: 'Marcos Witt',
    code: 'A1',
    number: 1,
    hymnalId: 'alabanzas',
    key: 'G',
    timeSignature: '4/4',
    bpm: 72,
    language: 'Castellano',
    categories: ['Adoración'],
    sections: [],
    lyrics: `INTRO
//G   Em   C   D

VERSO 1
//G            Em          C          D
Grande es el Señor y digno de loar
//G            Em          C          D
más grande que todo lo que Él ha creado
//G            Em          C          D
Él es mi roca y mi salvación
//G            Em          C          D
Él es mi escudo y mi libertad

CORO
//C          D         Em         G
Grande es el Señor y digno de loar
//C          D         Em         C
más grande que todo lo que Él ha creado
//C          D         Em
Él es mi roca y mi salvación
//C          D         G
Él es mi escudo y mi libertad

VERSO 2
//G          Em        C          D
Él es la luz que alumbrará mi ser
//G          Em        C          D
Él es el pan que me sustentará
//G          Em        C          D
Él es el agua que me saciará
//G          Em        C          D
Él es el Señor que me salvará

CORO
//C          D         Em         G
Grande es el Señor y digno de loar
//C          D         Em         C
más grande que todo lo que Él ha creado
//C          D         Em
Él es mi roca y mi salvación
//C          D         G
Él es mi escudo y mi libertad`,
    notes: '',
  },
  {
    id: 'a2',
    title: 'Renuévame',
    artist: 'Marcos Witt',
    code: 'A2',
    hymnalId: 'alabanzas',
    key: 'D',
    timeSignature: '4/4',
    bpm: 68,
    language: 'Castellano',
    categories: ['Adoración', 'Consagración'],
    sections: [],
    lyrics: `VERSO 1
//D                A
Renuévame, Señor Jesús
//Bm             F#m
Ya no quiero ser igual
//G              A
Renuévame, Señor Jesús
//D              A
Pon en mí tu corazón

CORO
//G              D
Porque todo lo que hay dentro de mí
//A              Bm
necesita ser cambiado, Señor
//G              D
Porque todo lo que hay dentro de mí
//A              D
necesita más de Ti

VERSO 2
//D                A
Renuévame, Señor Jesús
//Bm             F#m
Quiero agradarte más
//G              A
Quiero caminar en Tu verdad
//D              A
Quiero vivir en santidad

CORO
//G              D
Porque todo lo que hay dentro de mí
//A              Bm
necesita ser cambiado, Señor
//G              D
Porque todo lo que hay dentro de mí
//A              D
necesita más de Ti`,
    notes: '',
  },
  {
    id: 'a3',
    title: 'Al que está sentado en el trono',
    artist: 'Marcos Witt',
    code: 'A3',
    hymnalId: 'alabanzas',
    key: 'A',
    timeSignature: '4/4',
    bpm: 120,
    language: 'Castellano',
    categories: ['Alabanza', 'Adoración'],
    sections: [],
    lyrics: `VERSO 1
//A                    E
Al que está sentado en el trono
//F#m              E
y al Cordero, sea la alabanza
//A                E
honra, gloria y poder por los siglos
//F#m          E
Amén, amén

CORO
//A        E        F#m
Santo,   santo,   santo
//D              E            A
es el Señor Dios todo poderoso
//A              E          F#m
el que era, que es y que ha de venir
//D              E            A
el Señor Dios todo poderoso

VERSO 2
//A                  E
Digno eres, Señor, Dios nuestro
//F#m              E
de recibir la gloria, la honra
//A              E
y el poder, porque tú creaste
//F#m          E
todas las cosas

CORO
//A        E        F#m
Santo,   santo,   santo
//D              E            A
es el Señor Dios todo poderoso
//A              E          F#m
el que era, que es y que ha de venir
//D              E            A
el Señor Dios todo poderoso`,
    notes: '',
  },
  {
    id: 'a4',
    title: 'Te exaltamos',
    artist: 'Marcos Witt',
    code: 'A4',
    hymnalId: 'alabanzas',
    key: 'E',
    timeSignature: '4/4',
    bpm: 130,
    language: 'Castellano',
    categories: ['Alabanza'],
    sections: [],
    lyrics: `VERSO 1
//E              B
Te exaltamos, te exaltamos
//C#m            A
Te exaltamos, Señor
//E              B
Te exaltamos, te exaltamos
//C#m            A
Te exaltamos, Señor

CORO
//E              B
Porque tú eres grande
//C#m            A
Y porque tú eres santo
//E              B
Te alabamos, te alabamos
//C#m            A
Te alabamos, Señor

VERSO 2
//E              B
Aleluya, aleluya
//C#m            A
Aleluya, Señor
//E              B
Aleluya, aleluya
//C#m            A
Aleluya, Señor

CORO
//E              B
Porque tú eres grande
//C#m            A
Y porque tú eres santo
//E              B
Te alabamos, te alabamos
//C#m            A
Te alabamos, Señor`,
    notes: '',
  },
  {
    id: 'a5',
    title: 'En los lugares secretos',
    artist: 'Marcos Witt',
    code: 'A5',
    hymnalId: 'alabanzas',
    key: 'D',
    timeSignature: '4/4',
    bpm: 66,
    language: 'Castellano',
    categories: ['Adoración', 'Intimidad'],
    sections: [],
    lyrics: `VERSO 1
//D              A
En los lugares secretos
//Bm             G
Yo me encuentro contigo
//D              A
En los lugares secretos
//Bm             A
Tú me hablas a mí

CORO
//G              D
Y yo te busco, Señor
//A              Bm
Y yo te busco, Señor
//G              D
Porque tú eres mi todo
//G              A
Tú eres mi Dios

VERSO 2
//D              A
En mi cuarto cerrado
//Bm             G
Tú me esperas Señor
//D              A
En el secreto de mi alma
//Bm             A
Tú me amas Señor

CORO
//G              D
Y yo te busco, Señor
//A              Bm
Y yo te busco, Señor
//G              D
Porque tú eres mi todo
//G              A
Tú eres mi Dios`,
    notes: '',
  },
  // HIMNARIO BAUTISTA
  {
    id: 'b1',
    title: 'Castillo Fuerte es Nuestro Dios',
    artist: 'Martín Lutero',
    code: 'B1',
    hymnalId: 'bautista',
    key: 'C',
    timeSignature: '4/4',
    bpm: 100,
    language: 'Castellano',
    categories: ['Himno', 'Batalla espiritual'],
    sections: [],
    lyrics: `VERSO 1
//C          G          C          F
Castillo  fuerte es nuestro  Dios
//C          G          C
baluarte y  espada
//F          C          G
Con su poder  maravilloso
//F          G          C
nos defiende en la batalla

VERSO 2
//C              G          C
Nuestro antiguo enemigo
//C              G          C
busca hacernos mal
//F              C          G
astucia y poder tiene él
//F              G          C
no hay otro igual en la tierra

CORO
//F              C          G
Y nuestro príncipe eterno
//F              C
que es Cristo el Señor
//F              G          C
con su poder y su fuerza
//F              G          C
la victoria nos dio`,
    notes: '',
  },
  {
    id: 'b2',
    title: 'Sublime Gracia',
    artist: 'John Newton',
    code: 'B2',
    hymnalId: 'bautista',
    key: 'G',
    timeSignature: '3/4',
    bpm: 80,
    language: 'Castellano',
    categories: ['Himno', 'Gracia'],
    sections: [],
    lyrics: `VERSO 1
//G          G7         C
Sublime gracia del Señor
//G          Em         B7
que a un infeliz salvó
//Em         C          G
fui ciego mas me hizo ver
//D          D7         G
estaba muerto y viví

VERSO 2
//G          G7         C
Su gracia me enseñó a temer
//G          Em         B7
mis ojos la pudieron ver
//Em         C          G
y por su gracia hoy soy feliz
//D          D7         G
y por su gracia soy libre

VERSO 3
//G          G7         C
Cuando pasé el mar de aflicción
//G          Em         B7
por su gracia llegué al puerto
//Em         C          G
y por su gracia esperaré
//D          D7         G
vivir con Él en gloria`,
    notes: '',
  },
  {
    id: 'b3',
    title: 'Cuán Grande es Él',
    artist: 'Carl Boberg',
    code: 'B3',
    hymnalId: 'bautista',
    key: 'D',
    timeSignature: '3/4',
    bpm: 76,
    language: 'Castellano',
    categories: ['Himno', 'Adoración'],
    sections: [],
    lyrics: `VERSO 1
//D              G          D          A
Señor mi Dios, al contemplar los cielos
//D              G          D
el firmamento y las estrellas mil
//A              D          G          D
oyendo tu voz en los potentes truenos
//A              A7         D
y viendo obrar a Ti en su gir el sol

CORO
//G              D          A          D
Cantando entonces yo me gloriaré
//G              D          A          D
Cuán grande es Él, cuán grande es Él
//G              D          A          D
Cantando entonces yo me gloriaré
//G              D          A          D
Cuán grande es Él, cuán grande es Él

VERSO 2
//D              G          D          A
Cuando recorro los valles y montañas
//D              G          D
y al contemplar los campos de trigal
//A              D          G          D
y al observar las aves que vuelan
//A              A7         D
y al escuchar el canto del ruiseñor

CORO
//G              D          A          D
Cantando entonces yo me gloriaré
//G              D          A          D
Cuán grande es Él, cuán grande es Él
//G              D          A          D
Cantando entonces yo me gloriaré
//G              D          A          D
Cuán grande es Él, cuán grande es Él`,
    notes: '',
  },
  {
    id: 'b4',
    title: 'Mi Esperanza es el Señor',
    artist: 'Himnario Bautista',
    code: 'B4',
    hymnalId: 'bautista',
    key: 'F',
    timeSignature: '3/4',
    bpm: 72,
    language: 'Castellano',
    categories: ['Himno', 'Esperanza'],
    sections: [],
    lyrics: `VERSO 1
//F              C
Mi esperanza es el Señor
//F              C
mi roca y mi salvación
//Bb             F          C
Él es mi refugio
//Gm             C          F
mi torre fortaleza

VERSO 2
//F              C
En Él confío siempre
//F              C
Él nunca me fallará
//Bb             F          C
Su amor es fiel por siempre
//Gm             C          F
mi escudo y mi bien

CORO
//Bb             F
Mi esperanza es Él
//C              F
mi esperanza es Él
//Bb             F
Mi esperanza es el Señor
//Gm             C          F
mi esperanza es Él`,
    notes: '',
  },
  // HIMNARIO CALA (Aymara)
  {
    id: 'c1',
    title: 'Jach\'a Apu Dios / Gran Dios Padre',
    artist: 'Himnario Cala',
    code: 'C1',
    hymnalId: 'cala',
    key: 'Am',
    timeSignature: '4/4',
    bpm: 80,
    language: 'Aymara/Castellano',
    categories: ['Himno', 'Adoración'],
    sections: [],
    lyrics: `VERSO 1
//Am             Em
Jach'a Apu Dios, jiwasan Tatana
//Am             Em
Jach'a Apu Dios, jiwasan Mamana
//Dm             Am         E
Jach'a Apu Dios, jiwasan Apuna
//Dm             Am         E
Jach'a Apu Dios, jiwasan Chuymanana

CORO
//F              Am
Jilïri Apunakana
//F              Am
Wali ch'ama Apunakana
//F              Am
Jilïri Apunakana
//E              Am
Wali ch'ama Apunakana

VERSO 2
//Am             Em
Qhanañchiri Dios, jiwasan Tatana
//Am             Em
Qhanañchiri Dios, jiwasan Mamana
//Dm             Am         E
Qhanañchiri Dios, jiwasan Apuna
//Dm             Am         E
Qhanañchiri Dios, jiwasan Chuymanana

CORO
//F              Am
Jilïri Apunakana
//F              Am
Wali ch'ama Apunakana
//F              Am
Jilïri Apunakana
//E              Am
Wali ch'ama Apunakana`,
    lyricsByLanguage: {
      'Aymara': `VERSO 1
//Am             Em
Jach'a Apu Dios, jiwasan Tatana
//Am             Em
Jach'a Apu Dios, jiwasan Mamana
//Dm             Am         E
Jach'a Apu Dios, jiwasan Apuna
//Dm             Am         E
Jach'a Apu Dios, jiwasan Chuymanana

CORO
//F              Am
Jilïri Apunakana
//F              Am
Wali ch'ama Apunakana
//F              Am
Jilïri Apunakana
//E              Am
Wali ch'ama Apunakana

VERSO 2
//Am             Em
Qhanañchiri Dios, jiwasan Tatana
//Am             Em
Qhanañchiri Dios, jiwasan Mamana
//Dm             Am         E
Qhanañchiri Dios, jiwasan Apuna
//Dm             Am         E
Qhanañchiri Dios, jiwasan Chuymanana

CORO
//F              Am
Jilïri Apunakana
//F              Am
Wali ch'ama Apunakana
//F              Am
Jilïri Apunakana
//E              Am
Wali ch'ama Apunakana`,
      'Castellano': `VERSO 1
//Am             Em
Gran Dios Padre, nuestro Creador
//Am             Em
Gran Dios Padre, nuestra Madre
//Dm             Am         E
Gran Dios Padre, nuestro Señor
//Dm             Am         E
Gran Dios Padre, nuestro Corazón

CORO
//F              Am
Príncipe de los dioses
//F              Am
Muy poderoso dios
//F              Am
Príncipe de los dioses
//E              Am
Muy poderoso dios

VERSO 2
//Am             Em
Dios luminoso, nuestro Creador
//Am             Em
Dios luminoso, nuestra Madre
//Dm             Am         E
Dios luminoso, nuestro Señor
//Dm             Am         E
Dios luminoso, nuestro Corazón

CORO
//F              Am
Príncipe de los dioses
//F              Am
Muy poderoso dios
//F              Am
Príncipe de los dioses
//E              Am
Muy poderoso dios`
    },
    notes: '',
  },
  {
    id: 'c2',
    title: 'Diosaruxa Aruskipañani / Hablemos de Dios',
    artist: 'Himnario Cala',
    code: 'C2',
    hymnalId: 'cala',
    key: 'G',
    timeSignature: '4/4',
    bpm: 90,
    language: 'Aymara',
    categories: ['Himno', 'Testimonio'],
    sections: [],
    lyrics: `VERSO 1
//G
Diosaruxa aruskipañani
//Em
Diosaruxa aruskipañani
//C              D
Waliki Diosan sarnaqañani
//C              D
Waliki Diosan sarnaqañani

CORO
//G              Em
Diosan munapaja
//C              D
Diosan munapaja
//G              Em
Diosan munapaja
//C              D
Diosan munapaja

VERSO 2
//G
Diosampi sarnaqañani
//Em
Diosampi sarnaqañani
//C              G
Diosampi sarnaqañani
//C              D
Diosampi sarnaqañani

CORO
//G              Em
Diosan munapaja
//C              D
Diosan munapaja
//G              Em
Diosan munapaja
//C              D
Diosan munapaja`,
    notes: '',
  },
  // HIMNARIO QUECHUA
  {
    id: 'q1',
    title: 'Taytanchis Dios / Nuestro Padre Dios',
    artist: 'Himnario Quechua',
    code: 'Q1',
    hymnalId: 'quechua',
    key: 'D',
    timeSignature: '4/4',
    bpm: 84,
    language: 'Quechua',
    categories: ['Himno', 'Adoración'],
    sections: [],
    lyrics: `VERSO 1
//D              A          Bm         F#m
Taytanchis Dios, ñuqanchis Tayta
//G              D          A          D
Taytanchis Dios, ñuqanchis Mama
//D              A          Bm         F#m
Taytanchis Dios, ñuqanchis Apu
//G              D          A          D
Taytanchis Dios, ñuqanchis Yaya

CORO
//G              D
Hatun Diosninchis
//A              Bm
Hatun Diosninchis
//G              D
Hatun Diosninchis
//A              D
Hatun Diosninchis

VERSO 2
//D              A          Bm         F#m
K'anchayniyoq Dios, ñuqanchis Tayta
//G              D          A          D
K'anchayniyoq Dios, ñuqanchis Mama
//D              A          Bm         F#m
K'anchayniyoq Dios, ñuqanchis Apu
//G              D          A          D
K'anchayniyoq Dios, ñuqanchis Yaya

CORO
//G              D
Hatun Diosninchis
//A              Bm
Hatun Diosninchis
//G              D
Hatun Diosninchis
//A              D
Hatun Diosninchis`,
    notes: '',
  },
  {
    id: 'q2',
    title: 'Yayayku Dios / Padre Dios',
    artist: 'Himnario Quechua',
    code: 'Q2',
    hymnalId: 'quechua',
    key: 'G',
    timeSignature: '3/4',
    bpm: 76,
    language: 'Quechua',
    categories: ['Himno', 'Adoración'],
    sections: [],
    lyrics: `VERSO 1
//G              D          Em         C
Yayayku Dios, sumaq Diosnillay
//G              D          Em         C
Yayayku Dios, sumaq Diosnillay
//Am             D          G
Kuyawayku Dios, kuyawayku

CORO
//C              G
Alabayku Dios
//D              Em
Graciayku Dios
//C              G
Alabayku Dios
//D              G
Graciayku Dios

VERSO 2
//G              D          Em         C
Wawayki kani sumaq Diosnillay
//G              D          Em         C
Wawayki kani sumaq Diosnillay
//Am             D          G
Kuyawayku Dios, kuyawayku

CORO
//C              G
Alabayku Dios
//D              Em
Graciayku Dios
//C              G
Alabayku Dios
//D              G
Graciayku Dios`,
    notes: '',
  },
  // MIS CANCIONES
  {
    id: 'm1',
    title: 'Tu Fidelidad',
    artist: 'Personal',
    code: 'M1',
    hymnalId: 'mis-canciones',
    key: 'C',
    timeSignature: '4/4',
    bpm: 70,
    language: 'Castellano',
    categories: ['Adoración', 'Fidelidad'],
    sections: [],
    lyrics: `VERSO 1
//C              Am
Tu fidelidad, Señor
//F              C
es grande y eterna
//G              Am
Tu amor no falla jamás
//F              G
Tu gracia me sostendrá

CORO
//C              Am
Grande es tu fidelidad
//F              C
Grande es tu fidelidad
//G              Am
Cada mañana nueva es
//F              G
Tu gracia, Señor

VERSO 2
//C              Am
En la tormenta estás
//F              C
En la calma también
//G              Am
Tu voz me guía siempre
//F              G
Tu luz me da paz

CORO
//C              Am
Grande es tu fidelidad
//F              C
Grande es tu fidelidad
//G              Am
Cada mañana nueva es
//F              G
Tu gracia, Señor`,
    notes: '',
  },
];
