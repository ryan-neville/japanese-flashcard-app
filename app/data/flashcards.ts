export type KanaSet = "hiragana" | "katakana";

export type PhraseSet =
  // Japan Travel Phrasebook
  | "greetings"
  | "getting-around"
  | "dining"
  | "shopping"
  | "hotel"
  | "emergencies"
  | "everyday"
  | "numbers"
  // Japanese Restaurant Menu Guide
  | "alcoholic-drinks"
  | "non-alcoholic-drinks"
  | "appetizers"
  | "sushi-sashimi"
  | "noodles"
  | "rice-dishes"
  | "grilled-fried"
  | "hot-pot"
  | "soups"
  | "dessert";

export type CardSet = KanaSet | PhraseSet;

export interface Flashcard {
  japanese: string;
  romaji: string;
  set: CardSet;
  /**
   * English meaning. Present on phrase cards, where the front shows the
   * Japanese and romaji together and the back reveals this translation.
   * Kana cards omit it — their back reveals the romaji instead.
   */
  english?: string;
}

export const hiragana: Flashcard[] = [
  // Vowels
  { japanese: "あ", romaji: "a", set: "hiragana" },
  { japanese: "い", romaji: "i", set: "hiragana" },
  { japanese: "う", romaji: "u", set: "hiragana" },
  { japanese: "え", romaji: "e", set: "hiragana" },
  { japanese: "お", romaji: "o", set: "hiragana" },
  // K row
  { japanese: "か", romaji: "ka", set: "hiragana" },
  { japanese: "き", romaji: "ki", set: "hiragana" },
  { japanese: "く", romaji: "ku", set: "hiragana" },
  { japanese: "け", romaji: "ke", set: "hiragana" },
  { japanese: "こ", romaji: "ko", set: "hiragana" },
  // G row
  { japanese: "が", romaji: "ga", set: "hiragana" },
  { japanese: "ぎ", romaji: "gi", set: "hiragana" },
  { japanese: "ぐ", romaji: "gu", set: "hiragana" },
  { japanese: "げ", romaji: "ge", set: "hiragana" },
  { japanese: "ご", romaji: "go", set: "hiragana" },
  // S row
  { japanese: "さ", romaji: "sa", set: "hiragana" },
  { japanese: "し", romaji: "shi", set: "hiragana" },
  { japanese: "す", romaji: "su", set: "hiragana" },
  { japanese: "せ", romaji: "se", set: "hiragana" },
  { japanese: "そ", romaji: "so", set: "hiragana" },
  // Z row
  { japanese: "ざ", romaji: "za", set: "hiragana" },
  { japanese: "じ", romaji: "ji", set: "hiragana" },
  { japanese: "ず", romaji: "zu", set: "hiragana" },
  { japanese: "ぜ", romaji: "ze", set: "hiragana" },
  { japanese: "ぞ", romaji: "zo", set: "hiragana" },
  // T row
  { japanese: "た", romaji: "ta", set: "hiragana" },
  { japanese: "ち", romaji: "chi", set: "hiragana" },
  { japanese: "つ", romaji: "tsu", set: "hiragana" },
  { japanese: "て", romaji: "te", set: "hiragana" },
  { japanese: "と", romaji: "to", set: "hiragana" },
  // D row
  { japanese: "だ", romaji: "da", set: "hiragana" },
  { japanese: "ぢ", romaji: "ji", set: "hiragana" },
  { japanese: "づ", romaji: "zu", set: "hiragana" },
  { japanese: "で", romaji: "de", set: "hiragana" },
  { japanese: "ど", romaji: "do", set: "hiragana" },
  // N row
  { japanese: "な", romaji: "na", set: "hiragana" },
  { japanese: "に", romaji: "ni", set: "hiragana" },
  { japanese: "ぬ", romaji: "nu", set: "hiragana" },
  { japanese: "ね", romaji: "ne", set: "hiragana" },
  { japanese: "の", romaji: "no", set: "hiragana" },
  // H row
  { japanese: "は", romaji: "ha", set: "hiragana" },
  { japanese: "ひ", romaji: "hi", set: "hiragana" },
  { japanese: "ふ", romaji: "fu", set: "hiragana" },
  { japanese: "へ", romaji: "he", set: "hiragana" },
  { japanese: "ほ", romaji: "ho", set: "hiragana" },
  // B row
  { japanese: "ば", romaji: "ba", set: "hiragana" },
  { japanese: "び", romaji: "bi", set: "hiragana" },
  { japanese: "ぶ", romaji: "bu", set: "hiragana" },
  { japanese: "べ", romaji: "be", set: "hiragana" },
  { japanese: "ぼ", romaji: "bo", set: "hiragana" },
  // P row
  { japanese: "ぱ", romaji: "pa", set: "hiragana" },
  { japanese: "ぴ", romaji: "pi", set: "hiragana" },
  { japanese: "ぷ", romaji: "pu", set: "hiragana" },
  { japanese: "ぺ", romaji: "pe", set: "hiragana" },
  { japanese: "ぽ", romaji: "po", set: "hiragana" },
  // M row
  { japanese: "ま", romaji: "ma", set: "hiragana" },
  { japanese: "み", romaji: "mi", set: "hiragana" },
  { japanese: "む", romaji: "mu", set: "hiragana" },
  { japanese: "め", romaji: "me", set: "hiragana" },
  { japanese: "も", romaji: "mo", set: "hiragana" },
  // Y row
  { japanese: "や", romaji: "ya", set: "hiragana" },
  { japanese: "ゆ", romaji: "yu", set: "hiragana" },
  { japanese: "よ", romaji: "yo", set: "hiragana" },
  // R row
  { japanese: "ら", romaji: "ra", set: "hiragana" },
  { japanese: "り", romaji: "ri", set: "hiragana" },
  { japanese: "る", romaji: "ru", set: "hiragana" },
  { japanese: "れ", romaji: "re", set: "hiragana" },
  { japanese: "ろ", romaji: "ro", set: "hiragana" },
  // W row
  { japanese: "わ", romaji: "wa", set: "hiragana" },
  { japanese: "を", romaji: "wo", set: "hiragana" },
  { japanese: "ん", romaji: "n", set: "hiragana" },
  // Combinations
  { japanese: "きゃ", romaji: "kya", set: "hiragana" },
  { japanese: "きゅ", romaji: "kyu", set: "hiragana" },
  { japanese: "きょ", romaji: "kyo", set: "hiragana" },
  { japanese: "ぎゃ", romaji: "gya", set: "hiragana" },
  { japanese: "ぎゅ", romaji: "gyu", set: "hiragana" },
  { japanese: "ぎょ", romaji: "gyo", set: "hiragana" },
  { japanese: "しゃ", romaji: "sha", set: "hiragana" },
  { japanese: "しゅ", romaji: "shu", set: "hiragana" },
  { japanese: "しょ", romaji: "sho", set: "hiragana" },
  { japanese: "じゃ", romaji: "ja", set: "hiragana" },
  { japanese: "じゅ", romaji: "ju", set: "hiragana" },
  { japanese: "じょ", romaji: "jo", set: "hiragana" },
  { japanese: "ちゃ", romaji: "cha", set: "hiragana" },
  { japanese: "ちゅ", romaji: "chu", set: "hiragana" },
  { japanese: "ちょ", romaji: "cho", set: "hiragana" },
  { japanese: "にゃ", romaji: "nya", set: "hiragana" },
  { japanese: "にゅ", romaji: "nyu", set: "hiragana" },
  { japanese: "にょ", romaji: "nyo", set: "hiragana" },
  { japanese: "ひゃ", romaji: "hya", set: "hiragana" },
  { japanese: "ひゅ", romaji: "hyu", set: "hiragana" },
  { japanese: "ひょ", romaji: "hyo", set: "hiragana" },
  { japanese: "びゃ", romaji: "bya", set: "hiragana" },
  { japanese: "びゅ", romaji: "byu", set: "hiragana" },
  { japanese: "びょ", romaji: "byo", set: "hiragana" },
  { japanese: "ぴゃ", romaji: "pya", set: "hiragana" },
  { japanese: "ぴゅ", romaji: "pyu", set: "hiragana" },
  { japanese: "ぴょ", romaji: "pyo", set: "hiragana" },
  { japanese: "みゃ", romaji: "mya", set: "hiragana" },
  { japanese: "みゅ", romaji: "myu", set: "hiragana" },
  { japanese: "みょ", romaji: "myo", set: "hiragana" },
  { japanese: "りゃ", romaji: "rya", set: "hiragana" },
  { japanese: "りゅ", romaji: "ryu", set: "hiragana" },
  { japanese: "りょ", romaji: "ryo", set: "hiragana" },
];

export const katakana: Flashcard[] = [
  // Vowels
  { japanese: "ア", romaji: "a", set: "katakana" },
  { japanese: "イ", romaji: "i", set: "katakana" },
  { japanese: "ウ", romaji: "u", set: "katakana" },
  { japanese: "エ", romaji: "e", set: "katakana" },
  { japanese: "オ", romaji: "o", set: "katakana" },
  // K row
  { japanese: "カ", romaji: "ka", set: "katakana" },
  { japanese: "キ", romaji: "ki", set: "katakana" },
  { japanese: "ク", romaji: "ku", set: "katakana" },
  { japanese: "ケ", romaji: "ke", set: "katakana" },
  { japanese: "コ", romaji: "ko", set: "katakana" },
  // G row
  { japanese: "ガ", romaji: "ga", set: "katakana" },
  { japanese: "ギ", romaji: "gi", set: "katakana" },
  { japanese: "グ", romaji: "gu", set: "katakana" },
  { japanese: "ゲ", romaji: "ge", set: "katakana" },
  { japanese: "ゴ", romaji: "go", set: "katakana" },
  // S row
  { japanese: "サ", romaji: "sa", set: "katakana" },
  { japanese: "シ", romaji: "shi", set: "katakana" },
  { japanese: "ス", romaji: "su", set: "katakana" },
  { japanese: "セ", romaji: "se", set: "katakana" },
  { japanese: "ソ", romaji: "so", set: "katakana" },
  // Z row
  { japanese: "ザ", romaji: "za", set: "katakana" },
  { japanese: "ジ", romaji: "ji", set: "katakana" },
  { japanese: "ズ", romaji: "zu", set: "katakana" },
  { japanese: "ゼ", romaji: "ze", set: "katakana" },
  { japanese: "ゾ", romaji: "zo", set: "katakana" },
  // T row
  { japanese: "タ", romaji: "ta", set: "katakana" },
  { japanese: "チ", romaji: "chi", set: "katakana" },
  { japanese: "ツ", romaji: "tsu", set: "katakana" },
  { japanese: "テ", romaji: "te", set: "katakana" },
  { japanese: "ト", romaji: "to", set: "katakana" },
  // D row
  { japanese: "ダ", romaji: "da", set: "katakana" },
  { japanese: "ヂ", romaji: "ji", set: "katakana" },
  { japanese: "ヅ", romaji: "zu", set: "katakana" },
  { japanese: "デ", romaji: "de", set: "katakana" },
  { japanese: "ド", romaji: "do", set: "katakana" },
  // N row
  { japanese: "ナ", romaji: "na", set: "katakana" },
  { japanese: "ニ", romaji: "ni", set: "katakana" },
  { japanese: "ヌ", romaji: "nu", set: "katakana" },
  { japanese: "ネ", romaji: "ne", set: "katakana" },
  { japanese: "ノ", romaji: "no", set: "katakana" },
  // H row
  { japanese: "ハ", romaji: "ha", set: "katakana" },
  { japanese: "ヒ", romaji: "hi", set: "katakana" },
  { japanese: "フ", romaji: "fu", set: "katakana" },
  { japanese: "ヘ", romaji: "he", set: "katakana" },
  { japanese: "ホ", romaji: "ho", set: "katakana" },
  // B row
  { japanese: "バ", romaji: "ba", set: "katakana" },
  { japanese: "ビ", romaji: "bi", set: "katakana" },
  { japanese: "ブ", romaji: "bu", set: "katakana" },
  { japanese: "ベ", romaji: "be", set: "katakana" },
  { japanese: "ボ", romaji: "bo", set: "katakana" },
  // P row
  { japanese: "パ", romaji: "pa", set: "katakana" },
  { japanese: "ピ", romaji: "pi", set: "katakana" },
  { japanese: "プ", romaji: "pu", set: "katakana" },
  { japanese: "ペ", romaji: "pe", set: "katakana" },
  { japanese: "ポ", romaji: "po", set: "katakana" },
  // M row
  { japanese: "マ", romaji: "ma", set: "katakana" },
  { japanese: "ミ", romaji: "mi", set: "katakana" },
  { japanese: "ム", romaji: "mu", set: "katakana" },
  { japanese: "メ", romaji: "me", set: "katakana" },
  { japanese: "モ", romaji: "mo", set: "katakana" },
  // Y row
  { japanese: "ヤ", romaji: "ya", set: "katakana" },
  { japanese: "ユ", romaji: "yu", set: "katakana" },
  { japanese: "ヨ", romaji: "yo", set: "katakana" },
  // R row
  { japanese: "ラ", romaji: "ra", set: "katakana" },
  { japanese: "リ", romaji: "ri", set: "katakana" },
  { japanese: "ル", romaji: "ru", set: "katakana" },
  { japanese: "レ", romaji: "re", set: "katakana" },
  { japanese: "ロ", romaji: "ro", set: "katakana" },
  // W row
  { japanese: "ワ", romaji: "wa", set: "katakana" },
  { japanese: "ヲ", romaji: "wo", set: "katakana" },
  { japanese: "ン", romaji: "n", set: "katakana" },
  // Combinations
  { japanese: "キャ", romaji: "kya", set: "katakana" },
  { japanese: "キュ", romaji: "kyu", set: "katakana" },
  { japanese: "キョ", romaji: "kyo", set: "katakana" },
  { japanese: "ギャ", romaji: "gya", set: "katakana" },
  { japanese: "ギュ", romaji: "gyu", set: "katakana" },
  { japanese: "ギョ", romaji: "gyo", set: "katakana" },
  { japanese: "シャ", romaji: "sha", set: "katakana" },
  { japanese: "シュ", romaji: "shu", set: "katakana" },
  { japanese: "ショ", romaji: "sho", set: "katakana" },
  { japanese: "ジャ", romaji: "ja", set: "katakana" },
  { japanese: "ジュ", romaji: "ju", set: "katakana" },
  { japanese: "ジョ", romaji: "jo", set: "katakana" },
  { japanese: "チャ", romaji: "cha", set: "katakana" },
  { japanese: "チュ", romaji: "chu", set: "katakana" },
  { japanese: "チョ", romaji: "cho", set: "katakana" },
  { japanese: "ニャ", romaji: "nya", set: "katakana" },
  { japanese: "ニュ", romaji: "nyu", set: "katakana" },
  { japanese: "ニョ", romaji: "nyo", set: "katakana" },
  { japanese: "ヒャ", romaji: "hya", set: "katakana" },
  { japanese: "ヒュ", romaji: "hyu", set: "katakana" },
  { japanese: "ヒョ", romaji: "hyo", set: "katakana" },
  { japanese: "ビャ", romaji: "bya", set: "katakana" },
  { japanese: "ビュ", romaji: "byu", set: "katakana" },
  { japanese: "ビョ", romaji: "byo", set: "katakana" },
  { japanese: "ピャ", romaji: "pya", set: "katakana" },
  { japanese: "ピュ", romaji: "pyu", set: "katakana" },
  { japanese: "ピョ", romaji: "pyo", set: "katakana" },
  { japanese: "ミャ", romaji: "mya", set: "katakana" },
  { japanese: "ミュ", romaji: "myu", set: "katakana" },
  { japanese: "ミョ", romaji: "myo", set: "katakana" },
  { japanese: "リャ", romaji: "rya", set: "katakana" },
  { japanese: "リュ", romaji: "ryu", set: "katakana" },
  { japanese: "リョ", romaji: "ryo", set: "katakana" },
];

/** Builds a phrase deck from [japanese, romaji, english] rows. */
function phraseDeck(
  set: PhraseSet,
  rows: readonly (readonly [string, string, string])[],
): Flashcard[] {
  return rows.map(([japanese, romaji, english]) => ({ japanese, romaji, english, set }));
}

// ---------------------------------------------------------------------------
// Japan Travel Phrasebook
// ---------------------------------------------------------------------------

export const greetings = phraseDeck("greetings", [
  ["こんにちは", "Konnichiwa", "Hello / Good afternoon"],
  ["おはようございます", "Ohayou gozaimasu", "Good morning"],
  ["こんばんは", "Konbanwa", "Good evening"],
  ["さようなら", "Sayounara", "Goodbye"],
  ["またね", "Mata ne", "See you later"],
  ["ありがとうございます", "Arigatou gozaimasu", "Thank you"],
  ["ありがとう", "Arigatou", "Thank you (casual)"],
  ["どういたしまして", "Dou itashimashite", "You're welcome"],
  ["はい", "Hai", "Yes"],
  ["いいえ", "Iie", "No"],
  ["すみません", "Sumimasen", "Excuse me / Sorry"],
  ["ごめんなさい", "Gomen nasai", "I'm sorry"],
  ["お願いします", "Onegaishimasu", "Please"],
  ["はじめまして", "Hajimemashite", "Nice to meet you"],
  ["私は＿＿＿です", "Watashi wa ___ desu", "My name is ___"],
  ["わかりません", "Wakarimasen", "I don't understand"],
  ["英語を話せますか?", "Eigo o hanasemasu ka?", "Do you speak English?"],
  ["日本語があまりわかりません", "Nihongo ga amari wakarimasen", "I don't speak Japanese well"],
]);

export const gettingAround = phraseDeck("getting-around", [
  ["＿＿＿はどこですか?", "___ wa doko desu ka?", "Where is ___?"],
  ["駅", "Eki", "Train station"],
  ["出口", "Deguchi", "Exit"],
  ["入口", "Iriguchi", "Entrance"],
  ["ホーム", "Hoomu", "Platform"],
  ["切符", "Kippu", "Ticket"],
  ["改札口", "Kaisatsu-guchi", "Ticket gate"],
  ["乗り換え", "Norikae", "Transfer (trains)"],
  ["この電車は＿＿＿に行きますか?", "Kono densha wa ___ ni ikimasu ka?", "Does this train go to ___?"],
  ["これはいくらですか?", "Kore wa ikura desu ka?", "How much is this?"],
  ["切符を一枚お願いします", "Kippu o ichimai onegaishimasu", "One ticket please"],
  ["タクシー", "Takushii", "Taxi"],
  ["バス停", "Basu tei", "Bus stop"],
  ["左", "Hidari", "Left"],
  ["右", "Migi", "Right"],
  ["まっすぐ", "Massugu", "Straight ahead"],
]);

export const dining = phraseDeck("dining", [
  ["＿＿＿名です", "___ mei desu", "A table for ___ people"],
  ["一人です", "Hitori desu", "Table for 1"],
  ["二人です", "Futari desu", "Table for 2"],
  ["三人です", "San-nin desu", "Table for 3"],
  ["四人です", "Yo-nin desu", "Table for 4"],
  ["五人です", "Go-nin desu", "Table for 5"],
  ["メニューをお願いします", "Menyuu o onegaishimasu", "Menu, please"],
  ["おすすめは何ですか?", "Osusume wa nan desu ka?", "Recommendation?"],
  ["これをください", "Kore o kudasai", "I'll have this"],
  ["これを一つください", "Kore o hitotsu kudasai", "One of this, please"],
  ["これを二つください", "Kore o futatsu kudasai", "Two of this, please"],
  ["これを三つください", "Kore o mittsu kudasai", "Three of this, please"],
  ["一人前", "Ichi-nin mae", "One serving"],
  ["二人前", "Ni-nin mae", "Two servings"],
  ["もう一つください", "Mou hitotsu kudasai", "One more, please"],
  ["同じものをお願いします", "Onaji mono o onegaishimasu", "Same again, please"],
  ["おいしい", "Oishii", "Delicious"],
  ["乾杯!", "Kanpai!", "Cheers!"],
  ["水をお願いします", "Mizu o onegaishimasu", "Water, please"],
  ["お会計お願いします", "Okaikei onegaishimasu", "Check, please"],
  ["英語のメニューはありますか?", "Eigo no menyuu wa arimasu ka?", "Is there an English menu?"],
  ["＿＿＿のアレルギーがあります", "___ no arerugii ga arimasu", "I have an allergy to ___"],
  ["肉なし / ベジタリアン", "Niku nashi / Bejitarian", "No meat / vegetarian"],
  ["ごちそうさまでした", "Gochisousama deshita", "It was a feast (after eating)"],
  ["いただきます", "Itadakimasu", "Let's eat (before a meal)"],
  ["熱い", "Atsui", "Hot (temperature)"],
  ["冷たい", "Tsumetai", "Cold (drink/food)"],
]);

export const shopping = phraseDeck("shopping", [
  ["これはいくらですか?", "Kore wa ikura desu ka?", "How much is this?"],
  ["見ているだけです", "Mite iru dake desu", "Just looking, thanks"],
  ["＿＿＿はありますか?", "___ wa arimasu ka?", "Do you have ___?"],
  ["これをください", "Kore o kudasai", "I'll take this"],
  ["カードで払えますか?", "Kaado de haraemasu ka?", "Can I pay by card?"],
  ["現金", "Genkin", "Cash"],
  ["免税", "Menzei", "Tax-free"],
  ["レシート", "Reshiito", "Receipt"],
  ["高いです", "Takai desu", "Too expensive"],
  ["小さい/大きいサイズはありますか?", "Chiisai / ookii saizu wa arimasu ka?", "Smaller / bigger size?"],
]);

export const hotel = phraseDeck("hotel", [
  ["予約しています", "Yoyaku shite imasu", "I have a reservation"],
  ["チェックイン", "Chekku in", "Check-in"],
  ["チェックアウト", "Chekku auto", "Check-out"],
  ["鍵", "Kagi", "Key"],
  ["荷物", "Nimotsu", "Luggage"],
  ["荷物、預かってもらえますか?", "Nimotsu, azukatte moraemasu ka?", "Could you keep my luggage for me?"],
  ["午後3時まで荷物を預かってもらえますか?", "Gogo sanji made nimotsu o azukatte moraemasu ka?", "Can you keep my luggage until 3pm?"],
  ["朝食はついていますか?", "Choushoku wa tsuite imasu ka?", "Is breakfast included?"],
  ["温泉 / お風呂", "Onsen / Ofuro", "Hot spring / bath"],
  ["タオル", "Taoru", "Towel"],
]);

export const emergencies = phraseDeck("emergencies", [
  ["助けて!", "Tasukete!", "Help!"],
  ["救急車を呼んでください", "Kyuukyuusha o yonde kudasai", "Call an ambulance"],
  ["警察を呼んでください", "Keisatsu o yonde kudasai", "Call the police"],
  ["具合が悪いです", "Guai ga warui desu", "I'm sick"],
  ["病院", "Byouin", "Hospital"],
  ["薬局", "Yakkyoku", "Pharmacy"],
  ["ここが痛いです", "Koko ga itai desu", "It hurts here"],
  ["道に迷いました", "Michi ni mayoimashita", "I'm lost"],
]);

export const everyday = phraseDeck("everyday", [
  ["トイレはどこですか?", "Toire wa doko desu ka?", "Where is the restroom?"],
  ["写真を撮ってもいいですか?", "Shashin o totte mo ii desu ka?", "Can I take a photo?"],
  ["大丈夫ですか?", "Daijoubu desu ka?", "Is it okay? / Is this fine?"],
  ["大丈夫です", "Daijoubu desu", "It's okay / no problem"],
  ["ちょっと待ってください", "Chotto matte kudasai", "One moment, please"],
  ["わかりました", "Wakarimashita", "I understand"],
  ["ゆっくりお願いします", "Yukkuri onegaishimasu", "Slowly, please"],
  ["もう一度言ってください", "Mou ichido itte kudasai", "Can you say that again?"],
  ["かわいい", "Kawaii", "Cute"],
  ["すごい", "Sugoi", "Cool / awesome"],
]);

export const numbers = phraseDeck("numbers", [
  ["一", "Ichi", "1"],
  ["二", "Ni", "2"],
  ["三", "San", "3"],
  ["四", "Yon / Shi", "4"],
  ["五", "Go", "5"],
  ["六", "Roku", "6"],
  ["七", "Nana / Shichi", "7"],
  ["八", "Hachi", "8"],
  ["九", "Kyuu", "9"],
  ["十", "Juu", "10"],
  ["百", "Hyaku", "100"],
  ["千", "Sen", "1,000"],
  ["万", "Man", "10,000"],
]);

// ---------------------------------------------------------------------------
// Japanese Restaurant Menu Guide
// ---------------------------------------------------------------------------

export const alcoholicDrinks = phraseDeck("alcoholic-drinks", [
  ["ビール", "Biiru", "Beer"],
  ["生ビール", "Nama biiru", "Draft beer"],
  ["日本酒", "Nihonshu", "Sake"],
  ["熱燗", "Atsukan", "Hot sake"],
  ["冷酒", "Reishu", "Chilled sake"],
  ["焼酎", "Shochu", "Distilled spirit"],
  ["梅酒", "Umeshu", "Plum wine"],
  ["チューハイ", "Chuhai", "Shochu highball"],
  ["ハイボール", "Haiboru", "Whisky highball"],
  ["ワイン", "Wain", "Wine"],
]);

export const nonAlcoholicDrinks = phraseDeck("non-alcoholic-drinks", [
  ["お茶", "Ocha", "Green tea"],
  ["麦茶", "Mugicha", "Barley tea"],
  ["ほうじ茶", "Houjicha", "Roasted green tea"],
  ["水", "Mizu", "Water"],
  ["コーヒー", "Koohii", "Coffee"],
  ["ラムネ", "Ramune", "Japanese soda"],
  ["カルピス", "Karupisu", "Calpis (yogurt drink)"],
  ["りんごジュース", "Ringo juusu", "Apple juice"],
]);

export const appetizers = phraseDeck("appetizers", [
  ["枝豆", "Edamame", "Boiled soybeans"],
  ["餃子", "Gyoza", "Pan-fried dumplings"],
  ["唐揚げ", "Karaage", "Japanese fried chicken"],
  ["漬物", "Tsukemono", "Pickled vegetables"],
  ["揚げ出し豆腐", "Agedashi toufu", "Fried tofu in broth"],
  ["冷奴", "Hiyayakko", "Chilled tofu"],
  ["卵焼き", "Tamagoyaki", "Rolled omelet"],
  ["ポテトサラダ", "Potesara", "Potato salad"],
  ["れんこんチップス", "Renkon chips", "Lotus root chips"],
  ["ししゃも", "Shishamo", "Grilled smelt"],
]);

export const sushiSashimi = phraseDeck("sushi-sashimi", [
  ["鮪 / マグロ", "Maguro", "Tuna"],
  ["中トロ", "Chuutoro", "Medium-fatty tuna"],
  ["大トロ", "Otoro", "Fatty tuna belly"],
  ["サケ / シャケ", "Sake / Shake", "Salmon"],
  ["海老 / エビ", "Ebi", "Shrimp"],
  ["甘海老", "Amaebi", "Sweet shrimp"],
  ["卵", "Tamago", "Sweet egg omelet"],
  ["うなぎ", "Unagi", "Freshwater eel"],
  ["ハマチ", "Hamachi", "Yellowtail"],
  ["いくら", "Ikura", "Salmon roe"],
  ["うに", "Uni", "Sea urchin"],
  ["蛸 / タコ", "Tako", "Octopus"],
  ["イカ", "Ika", "Squid"],
  ["帆立 / ホタテ", "Hotate", "Scallop"],
  ["ねぎとろ", "Negitoro", "Minced tuna & scallion"],
  ["かっぱ巻き", "Kappa maki", "Cucumber roll"],
  ["手巻き", "Temaki", "Hand roll"],
  ["ちらし", "Chirashi", "Scattered sushi bowl"],
]);

export const noodles = phraseDeck("noodles", [
  ["ラーメン", "Ramen", "Ramen noodle soup"],
  ["醤油ラーメン", "Shoyu ramen", "Soy sauce ramen"],
  ["味噌ラーメン", "Miso ramen", "Miso ramen"],
  ["とんこつラーメン", "Tonkotsu ramen", "Pork bone broth ramen"],
  ["うどん", "Udon", "Thick wheat noodles"],
  ["そば", "Soba", "Buckwheat noodles"],
  ["ざるそば", "Zaru soba", "Chilled soba w/ dipping sauce"],
  ["焼きそば", "Yakisoba", "Stir-fried noodles"],
  ["つけ麺", "Tsukemen", "Dipping ramen"],
  ["ちゃんぽん", "Champon", "Nagasaki noodle soup"],
]);

export const riceDishes = phraseDeck("rice-dishes", [
  ["ご飯", "Gohan", "Plain rice"],
  ["丼", "Donburi", "Rice bowl"],
  ["カツ丼", "Katsudon", "Pork cutlet rice bowl"],
  ["親子丼", "Oyakodon", "Chicken & egg rice bowl"],
  ["牛丼", "Gyudon", "Beef rice bowl"],
  ["うな丼", "Unadon", "Eel rice bowl"],
  ["天丼", "Tendon", "Tempura rice bowl"],
  ["おにぎり", "Onigiri", "Rice ball"],
  ["チャーハン", "Chaahan", "Fried rice"],
  ["釜飯", "Kamameshi", "Pot-cooked rice"],
  ["オムライス", "Omuraisu", "Omelet rice"],
]);

export const grilledFried = phraseDeck("grilled-fried", [
  ["とんかつ", "Tonkatsu", "Breaded pork cutlet"],
  ["焼き鳥", "Yakitori", "Grilled chicken skewers"],
  ["天ぷら", "Tempura", "Battered, fried seafood/veg"],
  ["お好み焼き", "Okonomiyaki", "Savory pancake"],
  ["たこ焼き", "Takoyaki", "Octopus balls"],
  ["コロッケ", "Korokke", "Potato croquette"],
  ["メンチカツ", "Menchikatsu", "Fried minced meat cutlet"],
  ["焼き魚", "Yakizakana", "Grilled fish"],
  ["鯖塩焼き", "Saba shioyaki", "Salt-grilled mackerel"],
  ["牛タン", "Gyuutan", "Grilled beef tongue"],
]);

export const hotPot = phraseDeck("hot-pot", [
  ["しゃぶしゃぶ", "Shabu-shabu", "Hot pot, swished meat/veg"],
  ["すき焼き", "Sukiyaki", "Sweet soy hot pot"],
  ["鍋", "Nabe", "Hot pot (general)"],
  ["おでん", "Oden", "Simmered fish cakes & veg"],
  ["もつ鍋", "Motsunabe", "Offal hot pot"],
  ["ちゃんこ鍋", "Chanko nabe", "Sumo wrestler's hot pot"],
]);

export const soups = phraseDeck("soups", [
  ["味噌汁", "Miso shiru", "Miso soup"],
  ["吸い物", "Suimono", "Clear soup"],
  ["豚汁", "Tonjiru", "Pork & vegetable miso soup"],
]);

export const dessert = phraseDeck("dessert", [
  ["餅", "Mochi", "Rice cake"],
  ["あんみつ", "Anmitsu", "Jelly & fruit dessert"],
  ["どら焼き", "Dorayaki", "Red bean pancake"],
  ["大福", "Daifuku", "Mochi w/ sweet filling"],
  ["鯛焼き", "Taiyaki", "Fish-shaped cake, red bean"],
  ["団子", "Dango", "Sweet rice dumplings"],
  ["抹茶アイス", "Matcha aisu", "Matcha ice cream"],
  ["プリン", "Purin", "Custard pudding"],
]);

// ---------------------------------------------------------------------------
// Deck registry
// ---------------------------------------------------------------------------

export type DeckGroup = "Kana" | "Travel Phrasebook" | "Menu Guide";

export interface Deck {
  id: CardSet;
  group: DeckGroup;
  label: string;
  subtitle: string;
  /** Tailwind text-colour class used for the set badge on the card. */
  color: string;
  cards: Flashcard[];
}

export const decks: Deck[] = [
  {
    id: "hiragana",
    group: "Kana",
    label: "Hiragana",
    subtitle: "Basic syllabary",
    color: "text-rose-400",
    cards: hiragana,
  },
  {
    id: "katakana",
    group: "Kana",
    label: "Katakana",
    subtitle: "Loanword syllabary",
    color: "text-sky-400",
    cards: katakana,
  },
  {
    id: "greetings",
    group: "Travel Phrasebook",
    label: "Greetings & Basics",
    subtitle: "Japan Travel Phrasebook",
    color: "text-amber-400",
    cards: greetings,
  },
  {
    id: "getting-around",
    group: "Travel Phrasebook",
    label: "Getting Around",
    subtitle: "Transportation",
    color: "text-amber-400",
    cards: gettingAround,
  },
  {
    id: "dining",
    group: "Travel Phrasebook",
    label: "Dining",
    subtitle: "Restaurants, ordering & seating",
    color: "text-amber-400",
    cards: dining,
  },
  {
    id: "shopping",
    group: "Travel Phrasebook",
    label: "Shopping",
    subtitle: "Stores, payment & sizing",
    color: "text-amber-400",
    cards: shopping,
  },
  {
    id: "hotel",
    group: "Travel Phrasebook",
    label: "Hotel",
    subtitle: "Accommodation",
    color: "text-amber-400",
    cards: hotel,
  },
  {
    id: "emergencies",
    group: "Travel Phrasebook",
    label: "Emergencies & Health",
    subtitle: "Important to know before you go",
    color: "text-amber-400",
    cards: emergencies,
  },
  {
    id: "everyday",
    group: "Travel Phrasebook",
    label: "Useful Everyday Phrases",
    subtitle: "General-purpose phrases",
    color: "text-amber-400",
    cards: everyday,
  },
  {
    id: "numbers",
    group: "Travel Phrasebook",
    label: "Numbers",
    subtitle: "Handy for prices, ordering & counting",
    color: "text-amber-400",
    cards: numbers,
  },
  {
    id: "alcoholic-drinks",
    group: "Menu Guide",
    label: "Alcoholic Drinks",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: alcoholicDrinks,
  },
  {
    id: "non-alcoholic-drinks",
    group: "Menu Guide",
    label: "Non-Alcoholic Drinks",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: nonAlcoholicDrinks,
  },
  {
    id: "appetizers",
    group: "Menu Guide",
    label: "Appetizers & Sides",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: appetizers,
  },
  {
    id: "sushi-sashimi",
    group: "Menu Guide",
    label: "Sushi & Sashimi",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: sushiSashimi,
  },
  {
    id: "noodles",
    group: "Menu Guide",
    label: "Noodles",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: noodles,
  },
  {
    id: "rice-dishes",
    group: "Menu Guide",
    label: "Rice Dishes",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: riceDishes,
  },
  {
    id: "grilled-fried",
    group: "Menu Guide",
    label: "Grilled & Fried Mains",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: grilledFried,
  },
  {
    id: "hot-pot",
    group: "Menu Guide",
    label: "Hot Pot & Stews",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: hotPot,
  },
  {
    id: "soups",
    group: "Menu Guide",
    label: "Soups",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: soups,
  },
  {
    id: "dessert",
    group: "Menu Guide",
    label: "Dessert",
    subtitle: "Japanese Restaurant Menu Guide",
    color: "text-emerald-400",
    cards: dessert,
  },
];

export const deckById = new Map<CardSet, Deck>(decks.map((d) => [d.id, d]));

export const deckGroups: DeckGroup[] = ["Kana", "Travel Phrasebook", "Menu Guide"];
