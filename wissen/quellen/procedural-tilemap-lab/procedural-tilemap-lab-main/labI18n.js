export const LAB_UI_LANGUAGES = Object.freeze(["en", "ja"]);
export const LAB_UI_LANGUAGE_STORAGE_KEY = "procedural-tilemap-lab:ui-language:v1";

const JAPANESE_TEXT = Object.freeze({
  "Procedural Tilemap Lab - Map View": "Procedural Tilemap Lab - マップビュー",
  "Procedural Tilemap Lab - Material Lab": "Procedural Tilemap Lab - マテリアルラボ",
  "Procedural Tilemap Lab - Performance Baseline": "Procedural Tilemap Lab - 性能基準",
  "Lab pages": "ラボ画面",
  "Map View": "マップビュー",
  "Material Lab": "マテリアルラボ",
  "Performance Baseline": "性能基準",
  "Language": "言語",
  "Procedural Map Preview": "マップ生成プレビュー",
  "Generate, inspect, and export a reproducible procedural map.": "シードと設定からマップを生成し、内容を確認して出力します。同じシードを使えば、同じマップを再現できます。",
  "Diagnostic panels": "診断パネル",
  "Elements": "エレメント",
  "Performance": "パフォーマンス",
  "Map controls": "マップ操作",
  "Generation": "生成",
  "Biome": "環境タイプ",
  "Grassland": "草原",
  "Road": "街道",
  "Forest": "森",
  "Mountain": "山地",
  "Dungeon": "ダンジョン",
  "Landscape": "横長",
  "Portrait": "縦長",
  "Seed": "生成シード",
  "New Seed": "シードを再抽選",
  "Map size": "マップサイズ",
  "random": "ランダム",
  "preset": "プリセット",
  "custom": "カスタム",
  "Size preset": "サイズプリセット",
  "compact": "小型",
  "standard": "標準",
  "large": "大型",
  "Orientation": "縦横比",
  "auto": "自動",
  "landscape": "横長",
  "portrait": "縦長",
  "Width": "幅",
  "Height": "高さ",
  "Dungeon topology": "ダンジョン構造",
  "auto archetype (recommended)": "自動アーキタイプ（推奨）",
  "standard cavern": "標準洞窟",
  "narrow corridors v2.7 (variable)": "狭い通路 v2.7（可変）",
  "large hub v2 (variable)": "大広間 v2（可変）",
  "Appearance": "外観",
  "Terrain preset": "地形プリセット",
  "baseline": "基本",
  "vegetation reduced": "植生少なめ",
  "rocks emphasis": "岩を強調",
  "dungeon stone": "ダンジョン石材",
  "mountain path": "山道",
  "forest grove": "森の木立",
  "trail experiment": "小道実験",
  "Presentation effects": "ポストエフェクト",
  "Atmosphere": "雰囲気",
  "soft haze": "柔らかな霞",
  "golden motes": "金色の光粒",
  "cool mist": "冷たい霧",
  "late afternoon": "夕方",
  "overcast": "曇天",
  "none": "なし",
  "Vignette effect": "ビネット",
  "High terrace": "高台",
  "broad plateau": "広い台地",
  "Trees": "樹木",
  "sparse": "まばら",
  "normal": "通常",
  "High terraces": "高台の量",
  "Cliff height": "崖の高さ",
  "High spacing": "高台の間隔",
  "Display": "表示",
  "Player": "プレイヤー",
  "Enemies": "敵",
  "Grid": "グリッド",
  "Selected highlight": "選択を強調",
  "Reset player": "プレイヤーを戻す",
  "Export": "出力",
  "Use the integration bundle as the starting point for AI-assisted game integration.": "AI支援でゲームへ組み込む際は、統合バンドルを出発点として使用します。",
  "Bundle scope": "バンドル範囲",
  "Current environment": "現在の環境",
  "All environments": "すべての環境",
  "Include presentation effects": "ポストエフェクトを含める",
  "Export integration bundle": "統合バンドルを出力",
  "Checking bundle export…": "バンドル出力を確認中…",
  "PNG layers": "PNGレイヤー",
  "current preview": "現在のプレビュー",
  "base map + props": "基本マップ＋配置物",
  "base + actors": "基本＋アクター",
  "base + debug": "基本＋デバッグ",
  "Export PNG": "PNGを出力",
  "PNG is intended for visual review, comparison, and reports.": "PNGは見た目の確認・比較・報告資料向けです。",
  "Preparing map…": "マップを準備中…",
  "Move: arrows / WASD · Elements: E · Grid: G": "移動：矢印キー／WASD　エレメント：E　グリッド表示：G",
  "Rules: grass passable": "ルール: 草地は通行可能",
  "stone blocked": "石は通行不可",
  "tree trunk blocked": "木の幹は通行不可",
  "large rock blocked": "大岩は通行不可",
  "no height layer": "高さレイヤーなし",
  "visual-only grass, trails, brush, rocks": "見た目のみ: 草・小道・茂み・岩",
  "Technical details": "技術情報",
  "Close diagnostic dock": "診断パネルを閉じる",
  "Resize diagnostic panel": "診断パネルの幅を変更",
  "Dock width": "パネル幅",
  "Element debug map": "エレメント配置図",
  "Selected element": "選択中のエレメント",
  "None selected": "エレメントが選択されていません",
  "Copy element ID": "エレメントIDをコピー",
  "Copy AI context": "AI用データをコピー",
  "Element debug legend": "エレメントデバッグ凡例",
  "Performance panel": "パフォーマンスパネル",
  "Rules: dungeon floor passable": "ルール: ダンジョン床は通行可能",
  "walls and rubble blocked": "壁と瓦礫は通行不可",
  "stairs passable": "階段は通行可能",
  "no rocks / trees": "岩・樹木なし",
  "room-corridor topology": "部屋・通路構造",
  "visual-only stone wear, dust, cracks": "見た目のみ: 石の摩耗・埃・ひび",
  "Move blocked": "移動不可",
  "Updated": "設定反映済み",
  "Ready · AI adaptation bundle": "準備完了 · AI導入用バンドル",
  "Unavailable · start the latest local lab server": "利用不可 · 最新のローカルラボサーバーを起動してください",
  "Element legend": "エレメント一覧",
  "Select a row or click the debug map to highlight the same element in both views.": "一覧または要素配置図を選ぶと、対応する要素を両方で強調表示します。",
  "Passable: grass": "通行可：草地",
  "Blocked: stone, tree trunks, and large rocks": "通行不可：石・木の幹・大岩",
  "Height data: none": "高さ情報：なし",
  "No collision: grass, trails, brush, and rocks": "当たり判定なし：草・小道・茂み・岩",
  "Passable: dungeon floors and stairs": "通行可：ダンジョン床・階段",
  "Blocked: walls and rubble": "通行不可：壁・瓦礫",
  "Structure: rooms and corridors": "構造：部屋・通路",
  "No collision: stone wear, dust, and cracks": "当たり判定なし：石の摩耗・埃・ひび",
  "Resolved after generation.": "生成後のサイズと縦横比をここに表示します。",
  "Base Grass": "基本草地",
  "Grass Plane Light": "明るい草地（広域）",
  "Grass Plane Dark": "暗い草地（広域）",
  "Fine Grass Strokes": "細かな草模様",
  "Low Terrace Top": "低い段差の上面",
  "Low Terrace Soil Edge": "低い段差の土の縁",
  "Dirt Smudge": "薄い土模様",
  "Trail Track": "踏み跡",
  "Road Bed": "街道の路面",
  "Road Edge Grass": "街道端の草",
  "Forest Clearing": "森の空き地",
  "Forest Path": "森の小道",
  "Forest Wall": "森の境界",
  "Canopy Shade": "樹冠の影",
  "Dense Grass": "濃い草地",
  "Meadow Bed": "草床",
  "Flower Bed": "花畑",
  "Leaf Litter": "落ち葉",
  "Understory Brush": "下草の茂み",
  "Rock Ground": "岩混じりの地面",
  "Scree": "砂礫",
  "Dungeon Floor": "ダンジョン床",
  "Dungeon Wall": "ダンジョン壁",
  "Dungeon Wall Face": "ダンジョン壁面",
  "Dungeon Wall Top Risk": "天板不足の可能性がある壁",
  "Dungeon Floor Wear": "ダンジョン床の摩耗",
  "Dungeon Floor Moisture": "ダンジョン床の湿り",
  "Dungeon Wall Cracks": "ダンジョン壁のひび",
  "Dungeon Wall Moisture": "ダンジョン壁の湿り",
  "Dungeon Torch Warmth": "松明の暖色光",
  "Dungeon Rubble": "ダンジョンの瓦礫",
  "Dungeon Stairs": "ダンジョン階段",
  "Tree Canopy": "樹冠",
  "Tree Trunk": "木の幹",
  "Large Rock Body": "大岩本体",
  "High Terrace Cliff Face": "高台の崖面",
  "High Terrace Top": "高台の上面",
  "Collision High Terrace": "高台の当たり判定",
  "Collision Tree Trunk": "木の幹の当たり判定",
  "Collision Large Rock": "大岩の当たり判定",
  "Collision Rock": "岩の当たり判定",
  "Collision Forest Wall": "森の境界の当たり判定",
  "Collision Dungeon Wall": "ダンジョン壁の当たり判定",
  "Current map placement count": "現在のマップでの配置数",
  "Copy failed": "コピー失敗",
  "Copied element ID": "エレメントIDをコピーしました",
  "Copied AI context": "AI向け情報をコピーしました",
  "No measurement yet.": "まだ測定されていません。",
  "measured": "測定済み",
  "pending": "待機中",
  "Preview performance": "プレビュー性能",
  "Latest preview update": "直近のプレビュー更新",
  "Latest preview update. Cache misses include map generation; movement and repeated views may reuse caches.": "直近のプレビュー更新時間です。キャッシュがない場合はマップ生成を含み、移動や同じ条件の再表示ではキャッシュを再利用することがあります。",
  "preview total": "プレビュー更新合計",
  "renderer total": "描画処理合計",
  "outer": "全体",
  "inner": "内部",
  "export total": "出力合計",
  "base cache": "基本cache",
  "terrain cache": "地形cache",
  "atmo cache": "雰囲気cache",
  "effects": "エフェクト",
  "base draw": "基本描画",
  "terrain draw": "地形描画",
  "atmo draw": "雰囲気描画",
  "vignette": "ビネット",
  "debug": "デバッグ",
  "highlight": "強調表示",
  "actors": "アクター",
  "grid": "グリッド",

  "Update available!": "最新版があります！",
  "Material workspace": "素材編集",
  "Find a source, preview the result, then review and save a coherent change set.": "素材を選び、プレビューで確認しながら調整して保存します。",
  "Material Lab mode": "マテリアルラボのモード",
  "Props": "配置物",
  "Procedural Elements": "プロシージャルエレメント",
  "props": "配置物",
  "procedural elements": "プロシージャルエレメント",
  "Material browser": "マテリアルブラウザー",
  "Prop library": "素材一覧",
  "Element catalog": "エレメント一覧",
  "Loading sources...": "素材を読み込み中…",
  "Search assets": "素材を検索",
  "ID or label": "名前またはID",
  "Category": "カテゴリー",
  "All": "すべて",
  "Rocks": "岩",
  "Shape": "形状",
  "All shapes": "すべて",
  "Ledge": "岩棚",
  "Boulder": "巨岩",
  "Broadleaf": "広葉樹",
  "large rock": "大岩",
  "sprite rocks": "スプライト岩",
  "sprite trees": "スプライト樹木",
  "Sprite assets": "スプライト素材",
  "Sprite": "スプライト",
  "Procedural": "プロシージャル",
  "Search elements": "エレメントを検索",
  "Group": "グループ",
  "All groups": "すべてのグループ",
  "Status": "状態",
  "Wired": "接続済み",
  "Planned": "予定",
  "Procedural elements": "プロシージャルエレメント",
  "Material preview": "マテリアルプレビュー",
  "Live preview": "プレビュー",
  "Select a material": "マテリアルを選択",
  "Draft changes appear here immediately.": "下書きの変更はここへすぐ反映されます。",
  "Background": "背景",
  "Grass": "草地",
  "Dirt": "土",
  "Neutral": "無地",
  "Checker": "市松模様",
  "View": "表示内容",
  "Selected material": "選択中の素材",
  "Compare changes": "変更を比較",
  "Zoom": "表示倍率",
  "Fit": "全体表示",
  "Footprint": "占有範囲",
  "Shadow": "影",
  "Foot grass": "足元の草",
  "material lab ready": "マテリアルラボ準備完了",
  "Preview changes are drafts until saved": "保存するまでプレビュー変更は下書きです",
  "Material inspector": "マテリアルインスペクター",
  "Sprite inspector": "素材設定",
  "Resize material inspector": "素材設定パネルの幅を変更",
  "Copy asset ID": "素材IDをコピー",
  "Selected material status": "選択中マテリアルの状態",
  "checking": "確認中",
  "applied": "適用済み",
  "rollback": "ロールバック",
  "save mode checking": "保存方法を確認中",
  "Sprite prop editor state": "スプライト配置物の編集状態",
  "state checking": "状態を確認中",
  "no selected diff": "選択中の差分なし",
  "Ground contact and softness": "影の位置・大きさ・濃さ・柔らかさを調整します。",
  "X": "横位置（X）",
  "Y": "縦位置（Y）",
  "X width": "横幅",
  "Y width": "縦幅",
  "Angle": "角度",
  "Alpha": "不透明度",
  "Blur": "ぼかし",
  "Round": "丸み",
  "Placement footprint": "占有範囲",
  "Placement base; collision is edited separately": "配置時に使う占有範囲です。衝突判定の範囲は別に設定します。",
  "Collision": "衝突判定",
  "footprint -- / blocked --": "配置範囲 -- / 通行不可 --",
  "Expand left": "左へ拡張",
  "Expand right": "右へ拡張",
  "Expand up": "上へ拡張",
  "Expand down": "下へ拡張",
  "Trim empty": "空白を削る",
  "Collision tile editor": "衝突タイル編集",
  "Transform": "変形",
  "Anchor and rendered size": "基準点と描画サイズ",
  "Anchor X": "基準点 X",
  "Anchor Y": "基準点 Y",
  "Scale": "倍率",
  "Procedural inspector": "プロシージャル設定",
  "Procedural settings": "プロシージャル設定",
  "Scope": "適用範囲",
  "Editing scope": "適用範囲",
  "Global defaults": "全環境の基本値",
  "Environment override": "環境別の上書き",
  "Environment": "環境",
  "Save and change details": "保存と変更の詳細",
  "Procedural params status": "プロシージャル設定の状態",
  "Procedural editor state": "プロシージャル編集状態",
  "Parameters": "パラメーター",
  "Changes preview immediately in the active scope": "変更は現在の適用範囲へすぐプレビューされます",
  "Fine-grass bake": "細草のベイク",
  "Full-area transparent PNG for Map View": "マップビュー用の全域透過PNG",
  "Bake fine-grass PNG": "細草PNGをベイク",
  "bake mode checking": "ベイク方法を確認中",
  "No unsaved changes": "未保存の変更はありません",
  "Edits remain local drafts until you save them.": "保存するまで編集内容はローカルの下書きです。",
  "Undo last save": "直前の保存を取り消す",
  "Discard": "破棄",
  "Review": "確認",
  "Save changes": "変更を保存",
  "Review changes": "変更を確認",
  "Unsaved changes": "未保存の変更",
  "Close review": "変更確認を閉じる",
  "Close": "閉じる",
  "What should happen to this draft?": "この下書きをどうしますか？",
  "Save or discard changes before leaving the current editing scope.": "現在の編集範囲を離れる前に、変更を保存または破棄してください。",
  "Cancel": "キャンセル",
  "Save and continue": "保存して続行",
  "Saved": "保存済み",
  "Unsaved": "未保存",
  "Preview": "プレビュー",
  "Code only": "コードのみ",
  "Generated large rock": "自動生成の大岩",
  "code-generated / read only": "コード生成 / 読み取り専用",
  "Code-generated preview; there is no editable sprite manifest for this source.": "コード生成のプレビューです。この素材には編集可能なスプライト定義がありません。",
  "Read-only preview": "読み取り専用プレビュー",
  "Choose a wired element from the browser.": "接続済みエレメントをブラウザーから選択してください。",
  "Select a sprite asset": "スプライト素材を選択",
  "Select an element": "エレメントを選択",
  "No apply history this session": "今回の作業で反映した変更はありません。",
  "Applied": "適用済み",
  "Checking save server": "保存サーバーを確認中",
  "save ready": "保存可能",
  "Draft": "下書き",
  "Loading": "読み込み中",
  "Save unavailable": "保存不可",
  "rollback ready": "ロールバック可能",
  "rollback available": "ロールバック可能",
  "save unavailable": "保存不可",
  "collision waits for footprint apply": "衝突判定は配置範囲の適用待ち",
  "clean": "変更なし",
  "unsaved draft": "未保存の下書き",
  "saved values": "保存済み設定",
  "rocks": "岩",
  "trees": "樹木",
  "asset": "素材",
  "assets": "素材",
  "element": "エレメント",
  "elements": "エレメント",
  "change": "変更",
  "changes": "変更",
  "all": "すべて",
  "grass": "草地",
  "JSON save server ready": "JSON保存サーバー準備完了",
  "collision API present": "衝突判定APIあり",
  "footprint API present": "配置範囲APIあり",
  "transform API present": "変形APIあり",
  "atomic batch API present": "一括保存APIあり",
  "No sprite prop selected": "スプライト配置物が選択されていません",
  "No computed diff for current draft": "現在の下書きに計算済みの差分はありません",
  "No selected diff": "未保存の変更はありません。",
  "Can save to props.json": "props.jsonに保存可能",
  "No reversible change": "元に戻せる変更なし",
  "Rollback available": "元に戻せます",
  "Copied": "コピーしました",
  "State": "状態",
  "Asset": "素材",
  "Unsaved changes": "未保存の変更",
  "Save target": "保存先",
  "Note": "注記",
  "None": "なし",
  "tree props": "樹木の配置物",
  "rock props": "岩の配置物",
  "procedural prop": "プロシージャル配置物",
  "Boulder 01": "大岩01",
  "Boulder 02": "大岩02",
  "Boulder 03": "大岩03",
  "Oak 01": "広葉樹01",
  "No procedural element selected": "プロシージャルエレメントが選択されていません",
  "No diff on selected element; draft exists elsewhere": "選択中のエレメントに差分はありませんが、別の場所に下書きがあります",
  "Draft state changed; no scalar diff was produced.": "下書き状態は変わりましたが、数値差分はありません。",
  "Saving...": "保存中…",
  "BLOCK": "通行不可",
  "Apply environment override": "環境別の上書きを適用",
  "Apply all params": "全パラメーターを適用",
  "Reset override": "上書きをリセット",
  "Reset params": "パラメーターをリセット",
  "Rollback recipe": "レシピをロールバック",
  "Rollback params": "パラメーターをロールバック",
  "Opacity": "不透明度",
  "Brightness": "明るさ",
  "Saturation": "彩度",
  "Edge noise": "縁のノイズ",
  "Grass detail": "草の細部",
  "Soil warmth": "土の暖色度",
  "Strata": "地層",
  "Edge grass": "縁の草",
  "Density": "密度",
  "Size": "大きさ",
  "Edge feather": "縁のぼかし",
  "Noise": "ノイズ",
  "Warmth": "暖色度",
  "Hue shift": "色相ずらし",
  "Blade density": "草葉の密度",
  "Variation": "ばらつき",
  "Detail density": "細部の密度",
  "Seed offset": "シードずらし",
  "Forest strength": "森での強さ",
  "Grassland strength": "草原での強さ",
  "Mountain strength": "山地での強さ",
  "Contrast": "コントラスト",
  "Dark bias": "暗部の偏り",
  "Light bias": "明部の偏り",
  "Broad scale": "大域スケール",
  "Fine scale": "細部スケール",
  "Pixel size": "ピクセルサイズ",
  "Noise opacity": "ノイズ不透明度",
  "Low terrace": "低段差",
  "Ground detail": "地面の細部",

  "Performance Baseline v0.1": "性能基準 v0.1",
  "Grassland / current fixed": "草原 / 現行固定",
  "Road / current fixed": "街道 / 現行固定",
  "Forest / current fixed": "森 / 現行固定",
  "Mountain / current fixed": "山地 / 現行固定",
  "Dungeon / small fixed": "ダンジョン / 小型固定",
  "Dungeon / medium variable": "ダンジョン / 中型可変",
  "Dungeon / large variable": "ダンジョン / 大型可変",
  "Measure the same representative cases repeatedly with cold and warm caches, then compare medians.": "同じ代表ケースをcold cacheとwarm cacheで複数回測り、中央値を比較します。",
  "Repeats": "反復回数",
  "Run baseline": "基準測定を実行",
  "Download JSON": "JSONをダウンロード",
  "Preparing": "準備中",
  "Loading read-only assets.": "読み取り専用素材を読み込んでいます。",
  "Median results": "中央値の結果",
  "Cold clears renderer caches; warm redraws the same seed and settings immediately afterward.": "Coldはrenderer cacheを消去した測定、warmは同じseedと設定を直後に再描画した測定です。",
  "Case": "ケース",
  "Map": "マップ",
  "Layout": "構造",
  "Preview cold": "プレビュー cold",
  "Preview warm": "プレビュー warm",
  "Seed change": "シード変更",
  "Full map": "全体マップ",
  "PNG encode": "PNG変換",
  "Export total": "出力合計",
  "Not measured.": "未測定です。",
  "Raw JSON": "生JSON",
  "Ready": "準備完了",
  "Running": "測定中",
  "Benchmark running.": "性能測定を実行中です。",
  "Complete": "完了",
  "Failed": "失敗"
});

const JAPANESE_PATTERNS = Object.freeze([
  [/^(\d+) cases \/ read-only assets loaded$/, (_, cases) => `${cases}ケース / 読み取り専用素材の読込完了`],
  [/^(\d+) cases x (\d+) repeats complete$/, (_, cases, repeats) => `${cases}ケース × ${repeats}回の測定完了`],
  [/^(.+) \/ warm-up \/ case (\d+) of (\d+)$/, (_, label, current, total) => `${translateLabText(label, "ja")} / ウォームアップ / ${total}件中${current}件目`],
  [/^(.+) \/ (\d+) of (\d+) \/ case (\d+) of (\d+)$/, (_, label, repeat, repeats, current, total) => `${translateLabText(label, "ja")} / ${repeats}回中${repeat}回目 / ${total}件中${current}件目`],
  [/^(\d+) visible \/ rocks (\d+) \/ trees (\d+)$/, (_, visible, rocks, trees) => `${visible}件表示 / 岩 ${rocks} / 樹木 ${trees}`],
  [/^(\d+) visible \/ (\d+) wired \/ (\d+) planned$/, (_, visible, wired, planned) => `${visible}件表示 / 接続済み ${wired} / 予定 ${planned}`],
  [/^(\d+) elements$/, (_, count) => `${count}エレメント`],
  [/^(\d+) selected$/, (_, count) => `${count}件選択`],
  [/^(.+) · (\d+) placements$/, (_, label, count) => `${translateLabText(label, "ja")} · ${count}箇所`],
  [/^Resolved: (\d+)×(\d+) · (Landscape|Portrait)$/, (_, width, height, orientation) => `結果：${width}×${height}・${translateLabText(orientation, "ja")}`],
  [/^(.+) · (\d+)×(\d+) · (Landscape|Portrait) · Seed (\d+) · (.+)$/, (_, biome, width, height, orientation, seed, state) => `${translateLabText(biome, "ja")}｜${width}×${height}｜${translateLabText(orientation, "ja")}｜シード：${seed}｜${translateLabText(state, "ja")}`],
  [/^Ready · exported (.+)$/, (_, filename) => `準備完了 · ${filename}を出力しました`],
  [/^Unsaved changes: (\d+) (asset|assets|element|elements)$/, (_, count, unit) => `未保存の${translateLabText(unit, "ja")}が${count}件あります`],
  [/^(\d+) unsaved (.+)$/, (_, count, unit) => `${count}件の${translateLabText(unit, "ja")}が未保存`],
  [/^Save (\d+) (.+)$/, (_, count, unit) => `${count}件の${translateLabText(unit, "ja")}を保存`],
  [/^(\d+) dirty elements?$/, (_, count) => `${count}件に未保存の変更あり`],
  [/^Biome: (.+)$/, (_, biome) => `環境: ${translateLabText(biome, "ja")}`],
  [/^Environment: (.+)$/, (_, environment) => `環境: ${translateLabText(environment, "ja")}`],
  [/^Draft diff: (.+)$/, (_, diff) => `下書きの差分: ${diff}`],
  [/^Selected diff: (.+)$/, (_, diff) => `選択項目の差分: ${diff}`],
  [/^Lab boot failed: (.+)$/, (_, message) => `ラボの起動に失敗しました: ${message}`],
  [/^(.+) \[inherited\]$/, (_, label) => `${translateLabText(label, "ja")}［継承値］`],
  [/^(.+) \[override\]$/, (_, label) => `${translateLabText(label, "ja")}［上書き値］`],
  [/^collision (-?\d+),(-?\d+)$/, (_, x, y) => `衝突判定 ${x},${y}`],
  [/^footprint (.+) \/ edit (.+) \/ blocked (\d+)$/, (_, footprint, edit, blocked) => `配置範囲 ${footprint} / 編集範囲 ${edit} / 通行不可 ${blocked}`],
  [/^(.+) Save or discard the current draft first\.$/, (_, message) => `${translateLabText(message, "ja")} 現在の下書きを先に保存または破棄してください。`],
  [/^.+ \/ .+$/, (text) => text.split(" / ").map((part) => JAPANESE_TEXT[part] ?? part).join(" / ")]
]);

const TRANSLATED_ATTRIBUTES = Object.freeze(["aria-label", "placeholder", "title", "alt"]);
const sourceText = new WeakMap();
const sourceAttributes = new WeakMap();
let activeLanguage = "en";
let observer = null;

export function normalizeLabLanguage(value) {
  return LAB_UI_LANGUAGES.includes(value) ? value : "";
}

export function resolveLabLanguage({ search = "", stored = "", browserLanguages = [] } = {}) {
  const queryLanguage = normalizeLabLanguage(new URLSearchParams(search).get("lang"));
  if (queryLanguage) return queryLanguage;
  const storedLanguage = normalizeLabLanguage(stored);
  if (storedLanguage) return storedLanguage;
  return browserLanguages.some((value) => String(value).toLowerCase().startsWith("ja")) ? "ja" : "en";
}

export function translateLabText(value, language = activeLanguage) {
  const text = String(value ?? "");
  if (language !== "ja" || !text) return text;
  const exact = JAPANESE_TEXT[text];
  if (exact) return exact;
  for (const [pattern, translate] of JAPANESE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) return translate(...match);
  }
  return text;
}

export function currentLabLanguage() {
  return activeLanguage;
}

export function setLabLanguage(language, { persist = true, updateUrl = true } = {}) {
  const normalized = normalizeLabLanguage(language) || "en";
  activeLanguage = normalized;
  if (persist) writeStoredLanguage(normalized);
  if (updateUrl && globalThis.history && globalThis.location) {
    const url = new URL(globalThis.location.href);
    url.searchParams.set("lang", normalized);
    globalThis.history.replaceState(null, "", url);
  }
  applyDocumentLanguage();
  updateLanguageSwitch();
  globalThis.dispatchEvent?.(new CustomEvent("lab-language-change", { detail: { language: normalized } }));
  return normalized;
}

export function installLabI18n() {
  if (globalThis.__labI18n?.installed) return globalThis.__labI18n;
  const stored = readStoredLanguage();
  activeLanguage = resolveLabLanguage({
    search: globalThis.location?.search ?? "",
    stored,
    browserLanguages: globalThis.navigator?.languages ?? [globalThis.navigator?.language ?? ""],
  });
  if (normalizeLabLanguage(new URLSearchParams(globalThis.location?.search ?? "").get("lang"))) {
    writeStoredLanguage(activeLanguage);
  }
  installLanguageSwitch();
  applyDocumentLanguage();
  observeDocumentLanguage();
  const api = {
    installed: true,
    get language() { return activeLanguage; },
    setLanguage: setLabLanguage,
    translate: translateLabText,
  };
  globalThis.__labI18n = api;
  return api;
}

function installLanguageSwitch() {
  if (document.querySelector("#labLanguageSwitch")) return;
  const navigation = document.querySelector(".lab-nav");
  if (!navigation) return;
  const group = document.createElement("div");
  group.id = "labLanguageSwitch";
  group.className = "lab-language-switch";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Language");
  for (const [language, label] of [["en", "English"], ["ja", "日本語"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.labLanguage = language;
    button.textContent = label;
    button.addEventListener("click", () => setLabLanguage(language));
    group.append(button);
  }
  navigation.insertAdjacentElement("afterend", group);
  updateLanguageSwitch();
}

function updateLanguageSwitch() {
  for (const button of document.querySelectorAll("[data-lab-language]")) {
    const selected = button.dataset.labLanguage === activeLanguage;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("is-active", selected);
  }
}

function applyDocumentLanguage() {
  if (!globalThis.document) return;
  observer?.disconnect();
  document.documentElement.lang = activeLanguage;
  translateTree(document.documentElement);
  observer?.observe(document.documentElement, observerOptions());
}

function translateTree(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node);
    else translateTextNode(node);
  }
}

function translateTextNode(node) {
  if (shouldIgnoreTextNode(node)) return;
  if (!sourceText.has(node)) sourceText.set(node, node.nodeValue ?? "");
  const source = sourceText.get(node);
  const match = /^(\s*)(.*?)(\s*)$/s.exec(source);
  if (!match || !match[2]) return;
  node.nodeValue = `${match[1]}${translateLabText(match[2], activeLanguage)}${match[3]}`;
}

function shouldIgnoreTextNode(node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest("script, style, code, pre, textarea, [data-i18n-ignore]"));
}

function translateElementAttributes(element) {
  let sources = sourceAttributes.get(element);
  if (!sources) {
    sources = new Map();
    sourceAttributes.set(element, sources);
  }
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    if (!element.hasAttribute(attribute)) continue;
    if (!sources.has(attribute)) sources.set(attribute, element.getAttribute(attribute));
    element.setAttribute(attribute, translateLabText(sources.get(attribute), activeLanguage));
  }
}

function observeDocumentLanguage() {
  if (!globalThis.MutationObserver || !document.documentElement) return;
  observer = new MutationObserver((records) => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === "characterData") {
        sourceText.set(record.target, record.target.nodeValue ?? "");
        translateTextNode(record.target);
        continue;
      }
      if (record.type === "attributes") {
        const sources = sourceAttributes.get(record.target) ?? new Map();
        sources.set(record.attributeName, record.target.getAttribute(record.attributeName));
        sourceAttributes.set(record.target, sources);
        translateElementAttributes(record.target);
        continue;
      }
      for (const node of record.addedNodes) translateTree(node);
    }
    observer.observe(document.documentElement, observerOptions());
  });
  observer.observe(document.documentElement, observerOptions());
}

function observerOptions() {
  return {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATED_ATTRIBUTES,
  };
}

function readStoredLanguage() {
  try {
    return globalThis.localStorage?.getItem(LAB_UI_LANGUAGE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStoredLanguage(language) {
  try {
    globalThis.localStorage?.setItem(LAB_UI_LANGUAGE_STORAGE_KEY, language);
  } catch {}
}
