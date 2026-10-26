// The "internet" our search engine knows about. Made-up pages on made-up
// sites (.example is a reserved domain, so none of them exist).
//
// Some coffee pages contain the word "kaffe", some don't (espresso,
// cappuccino, bønner) — a text search finds the first kind, a vector search
// finds both. That difference is Session 18.

module.exports = [
  ["Kaffens historie", "https://historie.example/kaffe", "Kaffe kom til Danmark i 1600-tallet og blev hurtigt hverdagens drik."],
  ["Sådan afkalker du din espressomaskine", "https://maskinhjaelp.example/afkalkning", "Brug citronsyre og vand, og kør maskinen igennem to gange."],
  ["Den perfekte cappuccino", "https://baristaskolen.example/cappuccino", "Skummet mælk ved 60 grader og en dobbelt shot giver den bedste smag."],
  ["Bønner fra Etiopien", "https://risteriet.example/etiopien", "Lyst ristede bønner med en frugtig og blomstret smag."],
  ["Billig kaffe i Netto", "https://tilbud.example/netto-kaffe", "Ugens tilbud: 400 gram kaffe til 35 kroner."],
  ["Grøn te eller sort te?", "https://teguiden.example/groen-eller-sort", "Grøn te har mindre koffein og en mildere smag end sort te."],
  ["Kom i gang med at løbe", "https://motion.example/loeb-for-begyndere", "Start med 3 ture om ugen, og skift mellem gang og løb."],
  ["Fodbold: Superligaen i weekenden", "https://sport.example/superliga", "FC København møder Brøndby søndag i Parken."],
  ["Yoga for stive rygge", "https://motion.example/yoga-ryg", "Fem rolige øvelser, der løsner ryggen efter en dag foran skærmen."],
  ["En weekend i Rom", "https://rejser.example/rom", "Colosseum, pasta og is på Piazza Navona. Flyet tager under tre timer."],
  ["Billige flybilletter til Paris", "https://rejser.example/paris-fly", "Book tidligt og rejs tirsdag, så er billetterne ofte billigst."],
  ["Hvornår skal du skifte til vinterdæk?", "https://bilen.example/vinterdaek", "Når temperaturen kommer under 7 grader, griber sommerdæk dårligere."],
  ["Sådan sparer du på elregningen", "https://penge.example/el", "Sluk standby, vask ved 30 grader, og brug strøm om natten."],
  ["Lav et budget for din husholdning", "https://penge.example/budget", "Skriv alle faste udgifter ned, og sæt et beløb af til opsparing."],
  ["Hjemmebagt surdejsbrød", "https://opskrifter.example/surdej", "Mel, vand, salt og tid. Lad dejen hæve natten over i køleskabet."],
  ["Hurtig pasta med tomat", "https://opskrifter.example/pasta-tomat", "Hvidløg, flåede tomater og basilikum. Klar på 15 minutter."],
  ["Sov bedre om natten", "https://sundhed.example/soevn", "Gå i seng på samme tid hver dag, og undgå skærme den sidste time."],
  ["Kom i gang med Docker", "https://kode.example/docker", "Et image er en opskrift, en container er en kørende kopi af den."],
  ["Git for begyndere", "https://kode.example/git", "add, commit og push: de tre kommandoer, du bruger hver dag."],
  ["Sådan træner du din hvalp", "https://hund.example/hvalp", "Belønning virker bedre end skæld ud. Træn kort og ofte."],
];
