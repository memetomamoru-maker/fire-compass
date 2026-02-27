import { useState, useCallback, useRef, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell
} from "recharts";

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM — single source of truth
═══════════════════════════════════════════════════ */
const C = {
  // Backgrounds — ウォームサンド
  bg:      "#fafaf8",
  card:    "#ffffff",
  muted:   "#fdf8f0",
  deep:    "#0c1445",   // ディープネイビー
  // Primary — アンバー/ゴールドスケール
  g900: "#78350f", g800: "#92400e", g700: "#b45309",
  g600: "#d97706", g500: "#f59e0b", g400: "#fbbf24",
  g300: "#fcd34d", g200: "#fde68a", g100: "#fef9c3",
  // Accent
  fire:    "#f97316",
  fireL:   "#fff7ed",
  ember:   "#f59e0b",
  gold:    "#d97706",
  goldL:   "#fffbeb",
  // Semantic
  ok:    "#059669", okL:   "#ecfdf5",
  warn:  "#d97706", warnL: "#fffbeb",
  err:   "#dc2626", errL:  "#fef2f2",
  info:  "#0369a1", infoL: "#eff6ff",
  // Text — ネイビー系
  t1: "#0c1445",
  t2: "#1e3a5f",
  t3: "#4a5568",
  t4: "#718096",
  // Borders — ウォームサンド
  bdr:  "#e8dcc8",
  bdrS: "#d97706",
  // Share card
  shareB1: "#0c1445",
  shareB2: "#1e3a5f",
  shareB3: "#2d5986",
};
const FONT = "'Noto Sans JP', 'Hiragino Kaku Gothic Pro', sans-serif";
const SERIF = "'Shippori Mincho', Georgia, serif";

/* ═══════════════════════════════════════════════════
   LOGO / ICONS
═══════════════════════════════════════════════════ */
const Logo = ({ s = 40 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e293b"/><stop offset="100%" stopColor="#0f172a"/>
      </linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fcd34d"/><stop offset="100%" stopColor="#e8540a"/>
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill="url(#lg1)" stroke="#d97706" strokeWidth="0.8"/>
    <circle cx="24" cy="24" r="18" stroke="#fbbf24" strokeWidth="0.4" strokeDasharray="2 3"/>
    {/* Compass arrows */}
    <polygon points="24,5 26.5,21 24,24 21.5,21" fill="url(#lg2)"/>
    <polygon points="24,43 26.5,27 24,24 21.5,27" fill="#334155"/>
    <polygon points="5,24 21,21.5 24,24 21,26.5" fill="#334155"/>
    <polygon points="43,24 27,21.5 24,24 27,26.5" fill="#94a3b8"/>
    <circle cx="24" cy="24" r="3.5" fill="#fcd34d"/>
    <circle cx="24" cy="24" r="1.5" fill="#0f172a"/>
  </svg>
);
const IconCoin  = ({s=28})=><span style={{fontSize:s*0.7,lineHeight:1}}>💳</span>;
const IconHome  = ({s=28})=><span style={{fontSize:s*0.7,lineHeight:1}}>🏠</span>;
const IconChart = ({s=28})=><span style={{fontSize:s*0.7,lineHeight:1}}>📊</span>;
const IconBaby  = ({s=28})=><span style={{fontSize:s*0.7,lineHeight:1}}>👶</span>;
const IconFire  = ({s=28})=><span style={{fontSize:s*0.7,lineHeight:1}}>🔥</span>;

/* ═══════════════════════════════════════════════════
   FUND DATA
═══════════════════════════════════════════════════ */
const BUILT_IN_FUNDS = [
  {id:"orcan",  cat:"グローバル株式", name:"eMAXIS Slim 全世界株式（オルカン）",  rate:7.0,  risk:17, color:"#2d9156", ret:{y1:27.4,y3:18.2,y5:21.3,long:6.4},  desc:"世界約50か国・約2,800銘柄に超分散。新NISAで人気No.1の鉄板ファンド。"},
  {id:"em",     cat:"グローバル株式", name:"新興国株式インデックス（EM）",          rate:6.5,  risk:24, color:"#16a34a", ret:{y1:12.0,y3:7.5, y5:9.5, long:5.5},  desc:"中国・インド・ブラジル等の新興国に投資。高成長期待だがリスクも大きい。"},
  {id:"sp500",  cat:"米国株式",       name:"eMAXIS Slim 米国株式（S&P500）",       rate:7.5,  risk:19, color:"#1d4ed8", ret:{y1:32.6,y3:22.5,y5:24.8,long:7.0},  desc:"米国優良500社に連動。Apple・NVIDIA等テック銘柄中心。長期実績が豊富。"},
  {id:"nasdaq", cat:"米国株式",       name:"iFreeNEXT NASDAQ100",                  rate:10.0, risk:28, color:"#7c3aed", ret:{y1:38.2,y3:24.1,y5:28.5,long:12.0}, desc:"米国ハイテク100社集中型。高リスク高リターン。ボラティリティ大きめ。"},
  {id:"fang",   cat:"米国株式",       name:"FANG+（次世代テック10社）",             rate:12.0, risk:35, color:"#db2777", ret:{y1:55.0,y3:28.0,y5:32.0,long:14.0}, desc:"Meta/Apple/Amazon/Google/MS+αに集中投資。超ハイリスク超ハイリターン。"},
  {id:"nikkei", cat:"国内株式",       name:"日経225インデックス",                    rate:5.5,  risk:20, color:"#dc2626", ret:{y1:18.4,y3:14.2,y5:14.8,long:4.5},  desc:"日本代表225社に連動。為替リスクなし。国内景気に左右されやすい。"},
  {id:"topix",  cat:"国内株式",       name:"TOPIX（東証全体）",                      rate:5.0,  risk:19, color:"#ea580c", ret:{y1:16.2,y3:12.8,y5:13.5,long:4.2},  desc:"東証全上場約2,000社をカバー。日経225より幅広い分散が取れる。"},
  {id:"bal8",   cat:"バランス型",     name:"eMAXIS Slim バランス（8資産均等）",     rate:5.0,  risk:10, color:"#0ea5e9", ret:{y1:14.2,y3:8.4, y5:10.2,long:5.0},  desc:"株・債券・不動産を8資産均等。ほったらかし向け。リスク最小クラス。"},
  {id:"sesson", cat:"バランス型",     name:"セゾン・グローバルバランスファンド",    rate:5.5,  risk:11, color:"#06b6d4", ret:{y1:15.8,y3:9.2, y5:11.5,long:5.8},  desc:"国内外株式50%＋債券50%の2資産均等。長期運用実績あり。"},
  {id:"bond",   cat:"債券・その他",   name:"国内債券インデックス",                    rate:0.5,  risk:3,  color:"#64748b", ret:{y1:1.2, y3:0.8, y5:1.0, long:0.8},  desc:"安全性最重視。インフレには弱い。他資産のクッション役として組み合わせる。"},
  {id:"reit",   cat:"債券・その他",   name:"Jリート（国内不動産投信）",              rate:4.5,  risk:22, color:"#d97706", ret:{y1:8.5, y3:5.2, y5:7.8, long:4.5},  desc:"国内不動産投信。分配金が高め。株と異なる値動きで分散効果あり。"},
  {id:"gold",   cat:"債券・その他",   name:"ゴールド（金）インデックス",              rate:6.0,  risk:15, color:"#ca8a04", ret:{y1:22.0,y3:14.5,y5:16.0,long:6.0},  desc:"インフレ・有事に強い実物資産。株との相関が低く分散効果が高い。"},
];
const FUND_CATS = ["グローバル株式","米国株式","国内株式","バランス型","債券・その他"];
function getAllFunds(cf){ return [...BUILT_IN_FUNDS,...(cf||[])]; }

/* ═══════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════ */
const MAN = 10000;
const toY  = v => v * MAN;
const toM  = v => v / MAN;
const fmt  = v => { if(!isFinite(v)||isNaN(v)) return "---"; return v>=1e8 ? `${(v/1e8).toFixed(1)}億円` : `${Math.round(v/MAN).toLocaleString()}万円`; };
// fmtM: 万円単位の数値 → "XX万円" 文字列（万円を含む）
const fmtM = v => { if(!isFinite(v)||isNaN(v)) return "---万円"; return `${Math.round(v).toLocaleString()}万円`; };
// fmtMn: 万円単位の数値 → "XX万" 文字列（万円なし、後ろに単位を別途付ける場合）
const fmtMn = v => { if(!isFinite(v)||isNaN(v)) return "---"; return `${Math.round(v).toLocaleString()}万`; };
const rnd  = () => Math.sqrt(-2*Math.log(Math.random()+1e-10))*Math.cos(2*Math.PI*Math.random());

// 確実性を担保できる最大試行回数を動的に選択
// 目安: 500回で±5%の誤差、1000回で±3.5%、2000回で±2.5%
// FIRE計算のような長期シミュレーションには1000回が実用的バランス
const TRIALS = 1000;

function grossToNet(g){
  if(g<=200) return Math.round(g*0.87);
  if(g<=400) return Math.round(g*0.83);
  if(g<=600) return Math.round(g*0.80);
  if(g<=800) return Math.round(g*0.77);
  if(g<=1000) return Math.round(g*0.745);
  if(g<=1500) return Math.round(g*0.72);
  return Math.round(g*0.68);
}

function calcBlendedRate(allocs, cf){
  const all = getAllFunds(cf);
  const tot = allocs.reduce((s,a)=>s+a.pct,0);
  if(tot===0) return {rate:7.0,risk:17};
  const rate = allocs.reduce((s,a)=>s+(all.find(f=>f.id===a.id)?.rate||0)*a.pct,0)/tot;
  const risk = allocs.reduce((s,a)=>s+(all.find(f=>f.id===a.id)?.risk||15)*a.pct,0)/tot;
  return {rate:Math.round(rate*10)/10, risk:Math.round(risk*10)/10};
}

// 年金計算（付加年金・任意加入・確定拠出年金対応）
function calcPens(f){
  const kosei_m = f.pensionType==="kosei" ? Math.min(480,f.kosei_years*12) : 0;
  // 任意加入: 退職後〜65歳まで国民年金に任意加入できる（サラリーマン早期退職者も同様）
  const maxExtraYrs = Math.max(0, 65 - (f.retireAge||55));
  const extra_m = Math.min(maxExtraYrs*12, (f.kokumin_extra||0)*12);
  const base_m  = Math.min(480, kosei_m + extra_m);
  const base_m2 = f.pensionType==="kokumin"
    ? Math.min(480,(f.pensionStartAge-20)*12)
    : base_m;
  const kokumin = Math.round(795000 * Math.min(480, base_m2) / 480);
  // 付加年金: 保険料月200円追加→受給は月400円増（年額 400円×加入月数）
  // 国民年金加入者・早期退職後に任意加入してfuka_nenkinを有効にした場合
  const fukaM = f.pensionType==="kokumin"
    ? Math.min(480,(f.pensionStartAge-20)*12)
    : extra_m; // 退職後の任意加入期間のみ
  const fuka = (f.pensionType==="kokumin"||f.fuka_nenkin) && fukaM>0
    ? fukaM * 400 : 0; // 年額 = 400円/月 × 加入月数（受給側は倍の400円）
  const avgM = toY(f.kosei_lastSalary||f.annualIncome)/12;
  const kosei = f.pensionType==="kosei" ? Math.round(avgM*0.005481*f.kosei_years*12) : 0;
  // iDeCo/確定拠出年金（複利で積立）
  const ideco_annual = (f.ideco_active&&f.ideco_monthly) ? f.ideco_monthly*12*MAN : 0;
  const ideco_yrs    = Math.max(0, (f.retireAge||55)-(f.currentAge||35));
  const r = (f.ideco_rate||4)/100;
  const ideco_asset  = r>0 ? ideco_annual*((1+r)**ideco_yrs-1)/r : ideco_annual*ideco_yrs;
  return { base:kokumin, fuka, kosei, total:kokumin+fuka+kosei, ideco_asset:Math.round(ideco_asset/MAN) };
}
function calcPartnerPens(f){
  if(!f.hasPartner) return {total:0};
  // 専業主婦・主夫: 第3号被保険者 → 国民年金のみ
  // 婚姻期間を配偶者の年齢から65歳まで（簡易計算）
  const pensStartAge = f.pensionStartAge||65; // パートナーも同じ受給開始年齢で概算
  if(f.p_isHousewife){
    const m = Math.min(480,(pensStartAge-20)*12);
    const base = Math.round(795000*m/480);
    return {base, kosei:0, total:base};
  }
  // 共働き: パートナーの年金種別で計算
  const m = Math.min(480,(pensStartAge-20)*12);
  const b = Math.round(795000*m/480);
  const avgM = toY(f.p_salary||f.p_income)/12;
  const k = f.p_pensionType==="kosei" ? Math.round(avgM*0.005481*(f.p_kosei_years||20)*12) : 0;
  return {base:b, kosei:k, total:b+k};
}

// 教育費
const EDU = {kg:{pub:70,pri:158},el:{pub:211,pri:1000},jh:{pub:162,pri:430},hs:{pub:154,pri:315},
  univ_pub:243,univ_pri:430,univ_sci:550,univ_med:3000};
const PHASES=[{key:"kg",s:3,l:3},{key:"el",s:6,l:6},{key:"jh",s:12,l:3},{key:"hs",s:15,l:3},{key:"univ",s:18,l:4}];
function univCost(u){ return u==="med"?EDU.univ_med:u==="sci"?EDU.univ_sci:u==="pri"?EDU.univ_pri:EDU.univ_pub; }
function childTotal(lv){ return (lv.kg==="pri"?EDU.kg.pri:EDU.kg.pub)+(lv.el==="pri"?EDU.el.pri:EDU.el.pub)+(lv.jh==="pri"?EDU.jh.pri:EDU.jh.pub)+(lv.hs==="pri"?EDU.hs.pri:EDU.hs.pub)+univCost(lv.univ); }
function buildChildMap(children, curY){
  const m={};
  children.forEach(c=>{
    const lv = c.levels || {kg:"pub",el:"pub",jh:"pub",hs:"pub",univ:"pub"};
    const by = Math.round(c.birthYear) || curY;
    PHASES.forEach(ph=>{
      const cost=ph.key==="univ"?univCost(lv.univ):EDU[ph.key][lv[ph.key]==="pri"?"pri":"pub"];
      const py=Math.round(cost/ph.l);
      for(let i=0;i<ph.l;i++){const y=by+ph.s+i-curY; if(y>=0)m[y]=(m[y]||0)+py;}
    });
  });
  return m;
}

// 相続税（heirs=法定相続人数、デフォルト2人）
function inheritTax(e, heirs=2){
  const deduction = 3000 + 600*heirs; // 基礎控除
  const base=Math.max(0,e-deduction);
  if(base<=0)return 0;
  if(base<=1000)return Math.round(base*0.10);
  if(base<=3000)return Math.round(base*0.15-50);
  if(base<=5000)return Math.round(base*0.20-200);
  if(base<=10000)return Math.round(base*0.30-700);
  if(base<=20000)return Math.round(base*0.40-1700);
  if(base<=30000)return Math.round(base*0.45-2700);
  if(base<=60000)return Math.round(base*0.50-4200);
  return Math.round(base*0.55-7200);
}

/* モンテカルロ – 1000回で誤差±3.5%に抑制 */
function runMC({asset0,investYr,withdrawYr,years,rate,risk,evYen,pensYr,pensStartY,applyTax,
                emergencyFund=0, useEmergencyOnCrash=false}){
  const surv=new Array(years+1).fill(0);
  const paths=[];
  let emergency=emergencyFund*MAN; // 生活防衛資金（運用しない）
  for(let t=0;t<TRIALS;t++){
    let a=asset0; const path=[a]; let alive=true; let emer=emergency;
    for(let y=1;y<=years;y++){
      const r=rate/100+(risk/100)*rnd();
      const gain=a*r;
      const netG=(applyTax&&gain>0)?gain*0.79685:gain;
      const pens=y>=pensStartY?pensYr:0;
      const ev=evYen?.[y]||0;
      let need=withdrawYr+ev-pens;
      // 暴落時（リターン < -15%）は生活防衛資金から補填
      if(useEmergencyOnCrash && r<-0.15 && need>0 && emer>0){
        const fromEmer=Math.min(emer,need*0.5);
        emer=Math.max(0,emer-fromEmer); need=need-fromEmer;
      }
      a=Math.max(0,a+netG+investYr-need);
      if(a<=0)alive=false;
      if(alive)surv[y]++;
      path.push(a);
    }
    paths.push(path);
  }
  const pct=(arr,p)=>[...arr].sort((a,b)=>a-b)[Math.floor(arr.length*p)];
  const build=p=>paths[0].map((_,y)=>pct(paths.map(pa=>pa[y]),p));
  return {surv, median:build(.5), p90:build(.9), p75:build(.75), p25:build(.25), p10:build(.1)};
}

// ライフサイクル
function buildLC(form,rate,applyTax,evM){
  const curY=new Date().getFullYear();
  const pens=calcPens(form); const pp=calcPartnerPens(form);
  const totPY=pens.total+pp.total;
  const rows=[]; let a=toY(form.currentAsset);
  for(let y=0;y<=form.lifeExpectancy-form.currentAge;y++){
    const age=form.currentAge+y;
    const ret=age>=form.retireAge;
    const hasPens=age>=form.pensionStartAge;
    const inv=ret?0:toY(form.monthlyInvest)*12;
    const inf=(1+form.inflationRate/100)**y;
    const wd=ret?toY(form.annualWithdraw)*inf:0;
    const pensYr=hasPens?totPY:0;
    const ev=(evM[y]||0)*MAN;
    const gain=a*(rate/100);
    const netG=(applyTax&&gain>0)?gain*0.79685:gain;
    rows.push({year:curY+y,age,retired:ret,
      asset:Math.max(0,Math.round(toM(a))),
      invest:Math.round(toM(inv)), withdraw:Math.round(toM(wd)),
      pension:Math.round(toM(pensYr)), evCost:Math.round(toM(ev))});
    a=Math.max(0,a+netG+inv-wd+pensYr-ev);
  }
  return rows;
}

// FIRE診断
function diagFire(form){
  const e=form.annualExpense, s=form.sideIncome, c=form.currentAsset;
  return [
    {key:"lean",label:"リーンFIRE",  target:e*20,     color:C.g500, desc:"20倍ルール（5%取崩）。質素な完全リタイア。"},
    {key:"fire",label:"FIRE（標準）",    target:e*25,     color:C.g700, desc:"25倍ルール（4%取崩）。最もポピュラー。"},
    {key:"side",label:"サイドFIRE", target:(e-s)*25, color:C.g600, desc:"副業収入で生活費を補填するセミリタイア。"},
    {key:"fat", label:"FATFIRE",    target:e*33,     color:C.gold, desc:"33倍ルール（3%取崩）。余裕のリタイア。"},
  ].map(f=>({...f,achieved:c>=f.target,progress:Math.min(100,c/Math.max(f.target,1)*100),gap:Math.max(0,f.target-c)}));
}

// 資産層
const TIERS=[
  {label:"超富裕層",min:50000,color:"#92400e",desc:"5億円以上",  count:"約9万世帯"},
  {label:"富裕層",  min:10000,color:C.g800,  desc:"1〜5億円",  count:"約139万世帯"},
  {label:"準富裕層",min:5000, color:C.g700,  desc:"5,000万〜1億",count:"約341万世帯"},
  {label:"アッパーマス層",min:3000,color:C.g500,desc:"3,000〜5,000万",count:"約712万世帯"},
  {label:"マス層", min:0,    color:C.t3,    desc:"3,000万未満",count:"約4,215万世帯"},
];
const getTier=m=>TIERS.find(t=>m>=t.min)||TIERS[TIERS.length-1];

// 余剰資金で買えるもの（多様なライフスタイル対応）
const LUXURY_ITEMS=[
  {name:"世界一周旅行（ファーストクラス）", price:500,  icon:"✈️", cat:"旅行"},
  {name:"プライベートジェット（チャーター）",price:300,  icon:"🛩️", cat:"旅行"},
  {name:"ハワイコンドミニアム（購入）",     price:8000, icon:"🏖️", cat:"旅行"},
  {name:"モルディブ・ヴィラ1ヶ月滞在",     price:150,  icon:"🌊", cat:"旅行"},
  {name:"京都高級旅館（1年分・週1回）",     price:500,  icon:"♨️", cat:"旅行"},
  {name:"エルメス バーキン（25cm）",        price:200,  icon:"👜", cat:"ファッション"},
  {name:"エルメス ケリー バッグ",           price:250,  icon:"👛", cat:"ファッション"},
  {name:"シャネル ジュエリーフルセット",    price:500,  icon:"💎", cat:"ファッション"},
  {name:"高級エステ・スパ（年間通い放題）", price:100,  icon:"💆", cat:"美容"},
  {name:"パーソナルスタイリスト年間契約",   price:50,   icon:"👗", cat:"美容"},
  {name:"オーダーメイドドレス/スーツ10着",  price:100,  icon:"👘", cat:"ファッション"},
  {name:"銀座・高級鮨（年間月1回）",        price:100,  icon:"🍣", cat:"グルメ"},
  {name:"フレンチ3つ星10年分（月1回）",     price:500,  icon:"🍽️", cat:"グルメ"},
  {name:"高級ワインセラー（厳選100本）",    price:100,  icon:"🍷", cat:"グルメ"},
  {name:"世界最高峰レストラン巡り旅",       price:200,  icon:"🌍", cat:"グルメ"},
  {name:"パテック フィリップ（時計）",      price:700,  icon:"⌚", cat:"時計"},
  {name:"オーデマ ピゲ ロイヤルオーク",    price:400,  icon:"⌚", cat:"時計"},
  {name:"カルティエ タンク（ゴールド）",    price:150,  icon:"⌚", cat:"時計"},
  {name:"銀座高級マンション（購入）",       price:15000,icon:"🏙️", cat:"不動産"},
  {name:"タワマン最上階（購入）",           price:30000,icon:"🌆", cat:"不動産"},
  {name:"ポルシェ 911 Carrera",            price:1500, icon:"🏎️", cat:"車"},
  {name:"ランボルギーニ ウルス",            price:2800, icon:"🚗", cat:"車"},
  {name:"ロールスロイス ゴースト",          price:3500, icon:"👑", cat:"車"},
  {name:"テスラ モデルS（現金購入）",       price:130,  icon:"⚡", cat:"車"},
  {name:"プライベートシェフ（1年間）",      price:600,  icon:"👨‍🍳", cat:"生活"},
  {name:"ホームジム完全設備",               price:200,  icon:"🏋️", cat:"生活"},
  {name:"ヨガ・ピラティス専属トレーナー3年",price:150,  icon:"🧘", cat:"生活"},
  {name:"子の大学4年間・私立文系",          price:430,  icon:"🎓", cat:"教育"},
  {name:"留学1年間（欧米・語学学校）",      price:200,  icon:"📚", cat:"教育"},
];
/* ═══════════════════════════════════════════════════
   UI COMPONENTS — unified, consistent
═══════════════════════════════════════════════════ */

// Card
const Card = ({children, style}) => (
  <div style={{background:C.card, borderRadius:16, border:`1px solid ${C.bdr}`,
    padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(10,64,32,0.05)",
    marginBottom:14, ...style}}>{children}</div>
);

// Section heading inside a card
const SectionHead = ({icon, title, sub}) => (
  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:18}}>
    <div style={{background:C.g100,borderRadius:10,padding:"6px 8px",flexShrink:0,lineHeight:1}}>{icon}</div>
    <div>
      <div style={{fontSize:15,fontWeight:800,color:C.t1,letterSpacing:-0.3,fontFamily:FONT}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:C.t3,marginTop:2}}>{sub}</div>}
    </div>
  </div>
);

// Label with optional tooltip
function Lbl({children,tip}){
  const [show,setShow]=useState(false);
  return(
    <div style={{marginBottom:5}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <span style={{fontSize:12,fontWeight:600,color:C.t2}}>{children}</span>
        {tip&&<button onClick={()=>setShow(v=>!v)}
          style={{width:16,height:16,borderRadius:"50%",border:`1px solid ${C.g300}`,
            background:show?C.g500:C.muted,color:show?"#fff":C.t3,fontSize:9,
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            flexShrink:0,fontWeight:700,lineHeight:1,fontFamily:FONT}}>?</button>}
      </div>
      {tip&&show&&<div style={{marginTop:4,padding:"8px 12px",background:C.deep,color:"#d1fae5",
        borderRadius:8,fontSize:11,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>{tip}</div>}
    </div>
  );
}

// Number input — parseFloat safeguard: empty→keep old value
const Num = ({value,onChange,unit,min=0,max=99999,step=1}) => (
  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e=>{const v=e.target.value; if(v==="")return; const n=parseFloat(v); if(!isNaN(n))onChange(n);}}
      style={{flex:1,padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.bdr}`,
        background:"#fff",color:C.t1,fontSize:15,fontWeight:700,textAlign:"right",
        outline:"none",fontFamily:FONT,minWidth:0}}/>
    {unit&&<span style={{fontSize:12,color:C.t3,whiteSpace:"nowrap",flexShrink:0}}>{unit}</span>}
  </div>
);

// Progress bar
const Prog = ({val,color,h=8}) => (
  <div style={{height:h,background:C.g100,borderRadius:h/2,overflow:"hidden",marginTop:4}}>
    <div style={{height:"100%",width:`${Math.min(100,Math.max(0,val))}%`,
      background:`linear-gradient(90deg,${color}cc,${color})`,
      borderRadius:h/2,transition:"width 0.7s ease"}}/>
  </div>
);

// Badge / Tag
const Tag = ({label,color}) => (
  <span style={{display:"inline-block",padding:"2px 9px",borderRadius:99,fontSize:11,
    fontWeight:700,background:color+"1a",color,border:`1px solid ${color}44`}}>{label}</span>
);

// Stat card (for report overview)
const Stat = ({label,value,sub,color,icon,big}) => (
  <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.bdr}`,padding:"16px 18px",
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
    {icon&&<div style={{fontSize:22,marginBottom:6,lineHeight:1}}>{icon}</div>}
    <div style={{fontSize:11,color:C.t3,fontWeight:500,marginBottom:4}}>{label}</div>
    <div style={{fontSize:big?30:22,fontWeight:800,color:color||C.t1,lineHeight:1.1,
      fontFamily:big?SERIF:FONT}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.t3,marginTop:4}}>{sub}</div>}
  </div>
);

// Tooltip for charts
const Tip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:10,
      padding:"10px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",fontSize:12,fontFamily:FONT}}>
      <div style={{fontWeight:700,color:C.t1,marginBottom:4}}>{label}</div>
      {payload.filter(p=>p.value!=null&&p.value!==0).map(p=>(
        <div key={p.name} style={{color:p.color||C.g600,marginBottom:2}}>
          {p.name}: <b>{typeof p.value==="number"?p.value.toLocaleString()+"万":p.value}</b>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   FUND ALLOCATION EDITOR
═══════════════════════════════════════════════════ */
function FundAllocEditor({allocs,onChange,customFunds,onCustomFundsChange}){
  const allF=getAllFunds(customFunds);
  const total=allocs.reduce((s,a)=>s+a.pct,0);
  const blend=calcBlendedRate(allocs,customFunds);
  const [selCat,setSel]=useState("グローバル株式");
  const [showForm,setShowForm]=useState(false);
  const [cf,setCF]=useState({name:"",rate:7,risk:15,color:"#f97316",desc:""});
  const PCOLORS=["#f97316","#fbbf24","#ef4444","#a855f7","#06b6d4","#10b981","#64748b","#ec4899"];

  const add=id=>{if(allocs.find(a=>a.id===id))return; onChange([...allocs,{id,pct:Math.min(Math.max(0,100-total),100)}]);};
  const upd=(i,v)=>{const n=[...allocs];n[i]={...n[i],pct:v};onChange(n);};
  const rem=i=>onChange(allocs.filter((_,j)=>j!==i));
  const addCust=()=>{
    if(!cf.name.trim())return;
    const id="cust_"+Date.now();
    const nf={id,cat:"カスタム",...cf,rate:parseFloat(cf.rate)||7,risk:parseFloat(cf.risk)||15,ret:{y1:null,y3:null,y5:null,long:parseFloat(cf.rate)||7}};
    onCustomFundsChange([...(customFunds||[]),nf]);
    onChange([...allocs,{id,pct:Math.max(0,100-total)}]);
    setCF({name:"",rate:7,risk:15,color:"#f97316",desc:""}); setShowForm(false);
  };
  const remCust=id=>{onCustomFundsChange((customFunds||[]).filter(f=>f.id!==id));onChange(allocs.filter(a=>a.id!==id));};

  return(
    <div>
      {/* Selected */}
      {allocs.length>0&&<div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:0.8,marginBottom:8}}>選択中のファンド</div>
        {allocs.map((a,i)=>{
          const f=allF.find(fn=>fn.id===a.id); if(!f)return null;
          return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",
              background:"#fff",borderRadius:10,border:`1.5px solid ${f.color}33`,marginBottom:6,
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:f.color,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:C.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                <div style={{fontSize:10,color:C.t3}}>年率 <b style={{color:f.color}}>{f.rate}%</b> / リスク {f.risk}%</div>
              </div>
              <input type="range" min={0} max={100} step={5} value={a.pct}
                onChange={e=>upd(i,parseInt(e.target.value))}
                style={{width:72,accentColor:f.color,flexShrink:0}}/>
              <div style={{fontSize:14,fontWeight:800,color:f.color,width:36,textAlign:"right",flexShrink:0}}>{a.pct}%</div>
              <button onClick={()=>rem(i)} style={{padding:"2px 7px",borderRadius:6,border:`1px solid ${C.err}44`,
                background:"transparent",color:C.err,fontSize:12,cursor:"pointer",flexShrink:0}}>×</button>
            </div>
          );
        })}
      </div>}

      {/* Total bar */}
      <div style={{background:total===100?C.okL:total>100?C.errL:C.warnL,borderRadius:10,padding:"10px 14px",
        display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,
        border:`1px solid ${total===100?C.ok+"44":total>100?C.err+"44":C.warn+"44"}`}}>
        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
          <span style={{fontSize:11,color:C.t3}}>合計</span>
          <b style={{fontSize:22,fontWeight:800,color:total===100?C.ok:total>100?C.err:C.warn}}>{total}%</b>
          {total!==100&&<span style={{fontSize:11,color:C.t3}}>{total>100?"超過":"→ 100%にしてください"}</span>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.t3}}>期待リターン</div>
          <b style={{fontSize:18,fontWeight:800,color:C.fire}}>{blend.rate}%</b>
          <span style={{fontSize:10,color:C.t3,marginLeft:3}}>/ σ{blend.risk}%</span>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:0.8,marginBottom:8}}>ファンドを追加</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
        {[...FUND_CATS,"カスタム"].map(cat=>(
          <button key={cat} onClick={()=>setSel(cat)}
            style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",
              border:`1.5px solid ${selCat===cat?C.g500:C.bdr}`,
              background:selCat===cat?C.g100:C.card,color:selCat===cat?C.g700:C.t2}}>
            {cat}
          </button>
        ))}
      </div>

      {selCat!=="カスタム"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {allF.filter(f=>f.cat===selCat&&!allocs.find(a=>a.id===f.id)).map(f=>(
          <button key={f.id} onClick={()=>add(f.id)}
            style={{padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.bdr}`,
              background:C.muted,color:C.t1,fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"left",
              display:"flex",flexDirection:"column",gap:4,transition:"border-color 0.15s"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:f.color,flexShrink:0}}/>
              <span style={{fontSize:11,fontWeight:700,color:C.t1,lineHeight:1.3}}>{f.name}</span>
            </div>
            <div style={{fontSize:10,color:C.t3}}>年率 <b style={{color:f.color}}>{f.rate}%</b>　リスク {f.risk}%</div>
            <div style={{fontSize:10,color:C.t3,lineHeight:1.5}}>{f.desc}</div>
          </button>
        ))}
        {allF.filter(f=>f.cat===selCat).every(f=>allocs.find(a=>a.id===f.id))&&(
          <div style={{fontSize:12,color:C.t3,gridColumn:"1/-1",padding:8}}>このカテゴリは全て追加済みです。</div>
        )}
      </div>}

      {selCat==="カスタム"&&<div style={{marginBottom:12}}>
        {(customFunds||[]).map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",
            background:C.muted,borderRadius:8,marginBottom:6,border:`1px solid ${f.color}33`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:f.color}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:C.t1}}>{f.name}</div>
              <div style={{fontSize:10,color:C.t3}}>年率{f.rate}% / リスク{f.risk}%</div>
            </div>
            {!allocs.find(a=>a.id===f.id)&&<button onClick={()=>add(f.id)}
              style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${f.color}66`,
                background:f.color+"22",color:f.color,fontSize:11,cursor:"pointer",fontWeight:700}}>追加</button>}
            {allocs.find(a=>a.id===f.id)&&<span style={{fontSize:10,color:C.ok,fontWeight:700}}>✓ 使用中</span>}
            <button onClick={()=>remCust(f.id)} style={{padding:"3px 8px",borderRadius:6,
              border:`1px solid ${C.err}44`,background:"transparent",color:C.err,fontSize:11,cursor:"pointer"}}>削除</button>
          </div>
        ))}
        {!showForm&&<button onClick={()=>setShowForm(true)}
          style={{width:"100%",padding:10,borderRadius:10,border:`1.5px dashed ${C.fire}`,
            background:"transparent",color:C.fire,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          ＋ 任意のファンドを追加
        </button>}
        {showForm&&<div style={{background:C.muted,borderRadius:12,padding:16,border:`1px solid ${C.bdr}`}}>
          <div style={{fontWeight:700,color:C.fire,fontSize:13,marginBottom:12}}>🔧 カスタムファンドを作成</div>
          <div style={{marginBottom:10}}>
            <Lbl>ファンド名</Lbl>
            <input value={cf.name} onChange={e=>setCF(f=>({...f,name:e.target.value}))} placeholder="例: ひふみプラス"
              style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.bdr}`,
                background:"#fff",color:C.t1,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:FONT}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl>期待リターン（%）</Lbl>
              <input type="number" value={cf.rate} min={-5} max={30} step={0.5} onChange={e=>setCF(f=>({...f,rate:e.target.value}))}
                style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t1,fontSize:14,outline:"none",textAlign:"right",fontFamily:FONT}}/>
            </div>
            <div><Lbl>リスク（標準偏差%）</Lbl>
              <input type="number" value={cf.risk} min={0} max={50} step={1} onChange={e=>setCF(f=>({...f,risk:e.target.value}))}
                style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t1,fontSize:14,outline:"none",textAlign:"right",fontFamily:FONT}}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <Lbl>カラー</Lbl>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {PCOLORS.map(col=>(
                <div key={col} onClick={()=>setCF(f=>({...f,color:col}))}
                  style={{width:22,height:22,borderRadius:"50%",background:col,cursor:"pointer",
                    border:cf.color===col?`2px solid ${C.t1}`:`2px solid transparent`,
                    boxShadow:cf.color===col?"0 0 0 2px rgba(0,0,0,0.15)":""}}/>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addCust} style={{flex:1,padding:9,borderRadius:8,border:"none",
              background:C.fire,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>作成して追加</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"9px 14px",borderRadius:8,
              border:`1px solid ${C.bdr}`,background:"transparent",color:C.t3,fontSize:13,cursor:"pointer"}}>キャンセル</button>
          </div>
        </div>}
      </div>}

      {allocs.length>1&&(
        <div style={{marginTop:10,background:C.muted,borderRadius:12,padding:10}}>
          <PieChart width={200} height={140} style={{margin:"0 auto",display:"block"}}>
            <Pie data={allocs.map(a=>({name:allF.find(f=>f.id===a.id)?.name||"",value:a.pct}))}
              cx={100} cy={70} outerRadius={52} dataKey="value"
              label={({value})=>value+"%"} labelLine={false} labelStyle={{fontSize:9,fill:C.t3}}>
              {allocs.map((a,i)=><Cell key={a.id} fill={allF.find(f=>f.id===a.id)?.color||C.g500}/>)}
            </Pie>
          </PieChart>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SHARE CARD
═══════════════════════════════════════════════════ */
function ShareCard({form,results,blended}){
  const ref=useRef(null);
  const [saving,setSaving]=useState(false);
  const fireDone=results.fireDiag.filter(f=>f.achieved);
  const postSurv=Math.round((results.mcPost.surv[results.mcPost.surv.length-1]/TRIALS)*100);

  const handleDL=async()=>{
    if(!ref.current)return; setSaving(true);
    try{
      if(!window.html2canvas){
        await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
      }
      const canvas=await window.html2canvas(ref.current,{scale:2,backgroundColor:"#14532d",useCORS:true});
      canvas.toBlob(blob=>{const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`fire-compass-${form.name||"share"}.png`;a.click();URL.revokeObjectURL(url);},"image/png");
    }catch{alert("画像の保存に失敗しました。スクリーンショットをご利用ください。");}
    finally{setSaving(false);}
  };
  const copyText=(t)=>{
    navigator.clipboard.writeText(t).then(()=>alert("✅ コピーしました！")).catch(()=>{
      const el=document.createElement("textarea");el.value=t;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);alert("✅ コピーしました！");
    });
  };
  const achieved=fireDone.map(f=>f.label).join("・");
  const shareText=["【FIRE COMPASSでFIRE診断】"+(form.name?form.name+"さん（":"（")+form.currentAge+"歳）の資産シミュレーション","",
    "💳 金融資産: "+fmtM(form.currentAsset),"📊 老後資産生存率: "+postSurv+"%",
    achieved?"🔥 達成済み: "+achieved:"","リタイア予定: "+form.retireAge+"歳","","▶ あなたも診断してみよう",
    "https://fire-compass.app/"].filter(l=>l!==undefined).join("\n");

  return(
    <div>
      <div ref={ref} style={{background:"linear-gradient(135deg,#14532d 0%,#166534 100%)",
        borderRadius:20,padding:28,fontFamily:FONT,maxWidth:480,
        boxShadow:"0 4px 24px rgba(0,0,0,0.14)",position:"relative",overflow:"hidden"}}>
        {/* 背景デコ */}
        <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(234,88,12,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-40,left:-40,width:180,height:180,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          {/* ヘッダー */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Logo s={34}/>
              <div>
                <div style={{fontSize:13,fontWeight:900,color:"#f1f5f9",letterSpacing:2.5,fontFamily:SERIF}}>FIRE COMPASS</div>
                <div style={{fontSize:9,color:"#94a3b8",letterSpacing:1.5}}>経済的自由への羅針盤</div>
              </div>
            </div>
            <div style={{background:"rgba(234,88,12,0.2)",border:"1px solid rgba(234,88,12,0.4)",
              borderRadius:99,padding:"4px 12px"}}>
              <span style={{fontSize:11,color:"#fb923c",fontWeight:700}}>{form.currentAge}歳</span>
            </div>
          </div>
          {/* 名前 */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:22,fontWeight:700,color:"#f8fafc",fontFamily:SERIF,lineHeight:1.3}}>
              {form.name?`${form.name} さんの`:""}
              <span style={{color:"#fbbf24"}}> FIRE </span>レポート
            </div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>{blended.rate}% 期待リターン想定 ／ モンテカルロ{TRIALS}回</div>
          </div>
          {/* KPIグリッド */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{label:"金融資産",val:fmtM(form.currentAsset),icon:"💳",accent:"#4ade80"},
              {label:"退職時資産（中央値）",val:fmt(results.retireA),icon:"🎯",accent:"#60a5fa"},
              {label:"老後資産生存率",val:postSurv+"%",icon:"📊",accent:postSurv>=80?"#4ade80":postSurv>=50?"#fbbf24":"#f87171"},
              {label:"資産ランク",val:getTier(form.currentAsset).label,icon:"🏆",accent:"#fbbf24"},
            ].map(c=>(
              <div key={c.label} style={{background:"rgba(255,255,255,0.06)",borderRadius:12,
                padding:"13px 14px",border:`1px solid rgba(255,255,255,0.08)`,
                backdropFilter:"blur(4px)"}}>
                <div style={{fontSize:9,color:"#94a3b8",marginBottom:6,letterSpacing:0.5}}>{c.icon} {c.label}</div>
                <div style={{fontSize:18,fontWeight:800,color:c.accent,fontFamily:SERIF}}>{c.val}</div>
              </div>
            ))}
          </div>
          {/* FIRE達成バッジ */}
          {fireDone.length>0&&<div style={{background:"rgba(234,88,12,0.12)",borderRadius:12,
            padding:"10px 14px",border:"1px solid rgba(234,88,12,0.3)",marginBottom:12}}>
            <div style={{fontSize:9,color:"#fb923c",marginBottom:7,fontWeight:700,letterSpacing:1}}>🔥 達成済みFIREステータス</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {fireDone.map(f=>(
                <span key={f.key} style={{background:"rgba(251,146,60,0.15)",color:"#fb923c",
                  fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                  border:"1px solid rgba(251,146,60,0.3)"}}>✓ {f.label}</span>
              ))}
            </div>
          </div>}
          {/* フッター */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:12,marginTop:4}}>
            <div style={{fontSize:9,color:"#475569"}}>fire-compass.app</div>
            <div style={{fontSize:9,color:"#475569"}}>完全無料 • データ送信なし</div>
          </div>
        </div>
      </div>
      <button onClick={handleDL} disabled={saving}
        style={{marginTop:12,width:"100%",padding:"13px",borderRadius:12,border:"none",
          background:saving?C.g300:`linear-gradient(135deg,${C.g700},${C.g500})`,
          color:"#fff",fontSize:14,fontWeight:800,cursor:saving?"default":"pointer",
          boxShadow:saving?"none":`0 3px 10px rgba(26,140,63,0.22)`}}>
        {saving?"⏳ 生成中...":"📥 シェア画像をダウンロード"}
      </button>
      <div style={{fontSize:10,color:C.t3,textAlign:"center",marginTop:4}}>PNG形式 / X・Instagramに投稿可能</div>
      <div style={{marginTop:14,background:C.muted,borderRadius:12,padding:14,border:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:8}}>🔗 テキストでシェア</div>
        <textarea readOnly value={shareText}
          style={{width:"100%",height:110,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.bdr}`,
            background:"#fff",color:C.t1,fontSize:11,resize:"none",fontFamily:"monospace",
            boxSizing:"border-box",lineHeight:1.7}}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>copyText(shareText)}
            style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:C.g600,
              color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>📋 テキストをコピー</button>
          <button onClick={()=>window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(shareText.slice(0,200)+"..."),"_blank")}
            style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:"#1d9bf0",
              color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>𝕏 でシェア</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
const ITABS=["① 基本情報","② 資産","③ ファンド","④ 収支","⑤ インフレ・税","⑥ 年金","⑦ 子供","⑧ 贈与・相続","⑨ イベント"];
const RTABS=[
  {id:"overview",label:"📊 サマリー"},{id:"monte",label:"🎲 シミュレーション"},
  {id:"fund",label:"📈 ファンド"},{id:"lifeplan",label:"📅 ライフプラン"},
  {id:"fire",label:"🔥 FIRE診断"},{id:"position",label:"🏆 立ち位置"},
  {id:"pension",label:"🎌 年金・税"},{id:"inherit",label:"🏛 贈与・相続"},
  {id:"share",label:"📱 シェア"},
];

export default function FireCompass(){
  const [page,setPage]=useState("input");
  const [itab,setItab]=useState(0);
  const [rtab,setRtab]=useState("overview");
  const [results,setResults]=useState(null);
  const [grossMode,setGrossMode]=useState(false);
  const [grossIncome,setGrossIncome]=useState(700);
  const [pGrossMode,setPGrossMode]=useState(false);
  const [pGross,setPGross]=useState(400);

  const [form,setForm]=useState({
    name:"", currentAge:35, retireAge:55, lifeExpectancy:90,
    // Partner
    hasPartner:false, partnerAge:33, partnerRetireAge:53,
    p_isHousewife:false, p_income:400, p_pensionType:"kosei",
    p_kosei_years:30, p_salary:400,
    // Assets
    currentAsset:1000, investAsset:1000, emergencyFund:300,
    useEmergencyOnCrash:false,
    hasHome:false, homeValue:3000, homeLoan:1500,
    // Funds
    allocs:[{id:"orcan",pct:70},{id:"sp500",pct:30}], customFunds:[],
    // Income/expense
    monthlyInvest:10, annualIncome:600,
    annualExpense:300, annualWithdraw:240, sideIncome:0,
    // Inflation/tax
    inflationRate:1.5, applyTax:true,
    // Pension
    pensionType:"kosei", pensionStartAge:65,
    kosei_years:35, kosei_lastSalary:600, kokumin_extra:0,
    fuka_nenkin:false, // 付加年金
    ideco_active:false, ideco_monthly:2.3, ideco_rate:4, // iDeCo
    // Family
    children:[],
    // Gift
    giftActive:false, giftAmount:110, giftPeople:2, giftYears:10,
    giftReceiveActive:false, giftReceiveAmount:110, giftReceiveYears:5,
    _giftTab:"give",
    // 親の遺産
    inheritReceiveActive:false, inheritReceiveAmount:2000, inheritReceiveYear:2040,
    inheritSiblings:0, // 兄弟姉妹の人数（0=一人っ子）
    inheritHasDebt:false, inheritDebtAmount:0, // 負の遺産
    inheritInvestRatio:50, // 相続金の投資割合（%）
    // Life events
    lifeEvents:[],
  });
  const setF=useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);

  useEffect(()=>{ if(grossMode) setF("annualIncome",grossToNet(grossIncome)); },[grossMode,grossIncome]);
  useEffect(()=>{ if(pGrossMode) setF("p_income",grossToNet(pGross)); },[pGrossMode,pGross]);
  useEffect(()=>{
    if(form.p_isHousewife){
      setF("p_income",0); setPGrossMode(false);
    } else {
      // 専業主婦を外したら第1号（国民年金）をデフォルトに
      setF("p_pensionType","kokumin");
    }
  },[form.p_isHousewife]);
  // 投資資産＋生活防衛資金 → 現在の金融資産
  useEffect(()=>{ setF("currentAsset",(form.investAsset||0)+(form.emergencyFund||0)); },[form.investAsset,form.emergencyFund]);

  const blend=calcBlendedRate(form.allocs,form.customFunds);
  const totalAlloc=form.allocs.reduce((s,a)=>s+a.pct,0);
  const netHome=form.hasHome?Math.max(0,form.homeValue-form.homeLoan):0;
  const totalAsset=form.currentAsset+netHome;
  const pens=calcPens(form);
  const partnerPens=calcPartnerPens(form);
  const totalPensYr=pens.total+partnerPens.total;
  const curYear=new Date().getFullYear();

  const run=useCallback(()=>{
    if(totalAlloc!==100){alert("ファンド配分の合計を100%にしてください");return;}
    const preYrs=Math.max(0,form.retireAge-form.currentAge);
    const totYrs=Math.max(preYrs,form.lifeExpectancy-form.currentAge);
    const pensStartPost=form.pensionStartAge-form.retireAge;
    const childMap=buildChildMap(form.children,curYear);
    const evM={...childMap};
    form.lifeEvents.forEach(ev=>{const y=ev.year-curYear;if(y>=0&&y<=totYrs)evM[y]=(evM[y]||0)+ev.cost;});
    if(form.giftActive){for(let i=0;i<form.giftYears;i++){const y=i;if(y<=totYrs)evM[y]=(evM[y]||0)+form.giftAmount*form.giftPeople;}}
    if(form.giftReceiveActive){for(let i=0;i<form.giftReceiveYears;i++){const y=i;if(y<=totYrs)evM[y]=(evM[y]||0)-form.giftReceiveAmount;}}
    // 親の遺産（税引後の手取りをevMに計上）
    if(form.inheritReceiveActive){
      const iy=form.inheritReceiveYear-curYear;
      const siblings=Math.max(0,form.inheritSiblings||0);
      const totalH=siblings+1;
      const share=Math.round(form.inheritReceiveAmount/totalH);
      const debtSh=form.inheritHasDebt?Math.round((form.inheritDebtAmount||0)/totalH):0;
      const tax=inheritTax(share,totalH);
      const netShare=Math.max(0,share-debtSh-tax); // 税・債務控除後の手取り
      if(iy>=0&&iy<=totYrs) evM[iy]=(evM[iy]||0)-netShare; // マイナス=収入（支出の逆）
    }
    const evYen=Array.from({length:totYrs+1},(_,i)=>(evM[i]||0)*MAN);
    // 投資資産のみをモンテカルロに使用（生活防衛資金は別管理）
    const invest0=toY(form.investAsset||form.currentAsset);
    const mcPre=runMC({asset0:invest0,investYr:toY(form.monthlyInvest)*12,withdrawYr:0,
      years:preYrs,rate:blend.rate,risk:blend.risk,evYen,pensYr:0,pensStartY:999,applyTax:form.applyTax,
      emergencyFund:form.emergencyFund,useEmergencyOnCrash:form.useEmergencyOnCrash});
    const retireA=mcPre.median[preYrs]||invest0;
    const mcPost=runMC({asset0:retireA,investYr:0,withdrawYr:toY(form.annualWithdraw),
      years:totYrs-preYrs,rate:blend.rate,risk:blend.risk,
      evYen:evYen.slice(preYrs),pensYr:totalPensYr,pensStartY:Math.max(0,pensStartPost),
      applyTax:form.applyTax,emergencyFund:form.emergencyFund,useEmergencyOnCrash:form.useEmergencyOnCrash});
    const lifecycle=buildLC(form,blend.rate,form.applyTax,evM);
    const fireDiag=diagFire(form);
    const tier=getTier(form.currentAsset);
    const totalTier=getTier(totalAsset);
    const pctBrackets=form.currentAge<30?[0,0,10,30,70,100,200,380,600,1500]:
      form.currentAge<40?[0,0,20,80,150,250,450,700,1000,2000]:
      form.currentAge<50?[0,0,40,100,200,400,700,1200,1800,3000]:
      form.currentAge<60?[0,10,80,200,400,700,1100,1700,2500,4000]:
      [0,30,100,250,500,800,1300,2000,3000,5000];
    const asset=form.currentAsset;
    let pct;
    if(asset<=0)pct="下位10%以下";
    else if(asset>=pctBrackets[9])pct="上位10%";
    else{
      let idx=9; for(let pi=1;pi<10;pi++){if(asset<pctBrackets[pi]){idx=pi-1;break;}}
      const lo=pctBrackets[idx],hi=pctBrackets[idx+1]||pctBrackets[9];
      const frac=hi>lo?(asset-lo)/(hi-lo):0;
      const pn=Math.min(99,Math.round((idx+frac)*10));
      pct=pn>=90?"上位10%":pn>=80?"上位20%":pn>=70?"上位30%":pn>=60?"上位40%":pn>=50?"上位50%":"下位50%以下";
    }
    const estateAtDeath=Math.max(0,Math.round(toM(mcPost.median[mcPost.median.length-1]||0)));
    // 親の遺産受取分も自分の遺産として加算（相続した資産が死亡時まで残る概算）
    const siblingsCount = Math.max(0, form.inheritSiblings||0);
    const totalHeirs = siblingsCount + 1; // あなた含む
    const inheritShare = form.inheritReceiveActive
      ? Math.round(form.inheritReceiveAmount / totalHeirs) : 0;
    const inheritDebtShare = (form.inheritReceiveActive && form.inheritHasDebt)
      ? Math.round((form.inheritDebtAmount||0) / totalHeirs) : 0;
    const inheritNetShare = Math.max(0, inheritShare - inheritDebtShare);
    const inheritReceived = (form.inheritReceiveActive && inheritNetShare > 0) ? inheritNetShare : 0;
    // 親からの相続税（受け取り側として計算。法定相続人=兄弟数+配偶者想定で2名+兄弟数）
    const inheritReceiveTax = form.inheritReceiveActive && inheritShare > 0
      ? inheritTax(inheritShare, Math.max(1, totalHeirs)) : 0;
    // 自分が死亡時の相続税（子供2人想定）
    const myHeirs = Math.max(1, form.children.length || 2);
    const inheritT = inheritTax(estateAtDeath + netHome + inheritReceived, myHeirs);
    setResults({mcPre,mcPost,lifecycle,fireDiag,tier,totalTier,pct,retireA,estateAtDeath,inheritT,inheritReceiveTax,inheritReceived,inheritShare,inheritDebtShare,inheritNetShare});
    setPage("report"); setRtab("overview");
  },[form,blend,totalAlloc,totalAsset,netHome,totalPensYr,curYear]);

  /* ══════════ INPUT PAGE ══════════ */
  if(page==="input") return(
    <div style={{fontFamily:FONT,background:C.bg,minHeight:"100vh",padding:"0 0 80px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;900&family=Shippori+Mincho:wght@500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{font-family:'Noto Sans JP','Hiragino Kaku Gothic Pro',sans-serif;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        input,select,textarea,button{font-family:'Noto Sans JP','Hiragino Kaku Gothic Pro',sans-serif!important;}
        input[type=range]{accent-color:#e8540a;}
        input[type=checkbox],input[type=radio]{accent-color:#1a8c3f;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.g300};border-radius:4px;}
        input:focus,select:focus,textarea:focus{outline:2px solid ${C.g500}!important;outline-offset:1px;}
        button{transition:transform 0.1s,filter 0.1s,box-shadow 0.1s;}
        button:hover{filter:brightness(1.05);}
        button:active{transform:scale(0.97);}
        @media print{.noprint{display:none!important;}}
      `}</style>

      {/* ──── HERO ──── */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px 0"}}>
        {/* Logo row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Logo s={38}/>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:C.g700,letterSpacing:2.5,fontFamily:SERIF,lineHeight:1.1}}>FIRE COMPASS</div>
              <div style={{fontSize:10,color:C.t3,letterSpacing:1.5}}>経済的自由への羅針盤</div>
            </div>
          </div>
          <span style={{fontSize:10,color:C.t3,background:"#fff",padding:"4px 11px",borderRadius:99,border:`1px solid ${C.bdr}`,fontWeight:500}}>🔒 データは端末内のみ</span>
        </div>

        {/* Hero card — Left: text panel / Right: travel illustration */}
        <div style={{borderRadius:22,marginBottom:14,overflow:"hidden",
          boxShadow:"0 2px 16px rgba(7,60,120,0.10)",display:"flex",minHeight:230}}>

          {/* ── LEFT: Text panel (solid dark background, fully readable) ── */}
          <div style={{flex:"0 0 54%",background:"linear-gradient(160deg,#0c1445 0%,#1e3a5f 100%)",
            padding:"22px 22px 20px",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            {/* subtle glow accent */}
            <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(232,84,10,0.18) 0%,transparent 65%)",pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:1}}>
              {/* Eyebrow */}
              <div style={{display:"inline-flex",alignItems:"center",gap:5,
                background:"rgba(232,84,10,0.85)",borderRadius:99,padding:"3px 11px",marginBottom:12}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                <span style={{fontSize:9,color:"#fff",fontWeight:700,letterSpacing:1.3}}>FIRE SIMULATOR</span>
              </div>
              {/* Headline */}
              <h1 style={{fontFamily:SERIF,fontSize:20,color:"#f0fdf4",margin:"0 0 10px",
                fontWeight:800,lineHeight:1.5,letterSpacing:-0.2}}>
                あなたの<span style={{color:"#fcd34d"}}>FIRE</span>達成まで、<br/>
                <span style={{fontSize:17,color:"#bfdbfe"}}>あと何年・いくら必要？</span>
              </h1>
              {/* Feature tags */}
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px 8px",marginBottom:12}}>
                {["📊 モンテカルロ"+TRIALS+"回","🏦 年金・iDeCo","👨‍👩‍👧 教育費","🎁 相続試算","🔒 送信なし"].map(b=>(
                  <span key={b} style={{fontSize:9,color:"#93c5fd",fontWeight:600,
                    background:"rgba(255,255,255,0.08)",
                    padding:"3px 8px",borderRadius:99,border:"1px solid rgba(147,197,253,0.2)"}}>{b}</span>
                ))}
              </div>
              {/* FIRE type pills */}
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {[{l:"リーンFIRE",c:"#4ade80"},{l:"サイドFIRE",c:"#fcd34d"},
                  {l:"FIRE（標準）",c:"#fb923c"},{l:"FATFIRE",c:"#f87171"}].map(t=>(
                  <div key={t.l} style={{background:"rgba(255,255,255,0.07)",
                    borderRadius:6,padding:"4px 8px",border:`1px solid ${t.c}44`}}>
                    <div style={{fontSize:9,color:t.c,fontWeight:700}}>{t.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: big suitcase centred, stickers inside ── */}
          <div style={{flex:"0 0 46%",position:"relative",overflow:"hidden"}}>
            <svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice"
              style={{display:"block",width:"100%",height:"100%"}}>
              <defs>
                <linearGradient id="il_sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#29b6f6"/>
                  <stop offset="60%"  stopColor="#64d2f7"/>
                  <stop offset="100%" stopColor="#b3e5fc"/>
                </linearGradient>
                <linearGradient id="il_sea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0288d1"/>
                  <stop offset="100%" stopColor="#01579b"/>
                </linearGradient>
                <linearGradient id="il_sand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ffe082"/>
                  <stop offset="100%" stopColor="#ffca28"/>
                </linearGradient>
                <linearGradient id="il_bag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#c87838"/>
                  <stop offset="100%" stopColor="#7c3810"/>
                </linearGradient>
                <radialGradient id="il_sun" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#fff9c3"/>
                  <stop offset="100%" stopColor="#fff9c300"/>
                </radialGradient>
                <filter id="il_blur"><feGaussianBlur stdDeviation="3"/></filter>
                <filter id="il_drop"><feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.14"/></filter>
                {/* clip stickers strictly inside bag face */}
                <clipPath id="il_bagClip">
                  <rect x="50" y="84" width="220" height="138" rx="12"/>
                </clipPath>
              </defs>

              {/* Sky */}
              <rect width="320" height="240" fill="url(#il_sky)"/>

              {/* Sun — top right */}
              <circle cx="286" cy="38" r="55" fill="url(#il_sun)" opacity="0.65"/>
              <circle cx="286" cy="38" r="25" fill="#fff9c3" opacity="0.96"/>
              <circle cx="286" cy="38" r="18" fill="#ffe566"/>

              {/* Clouds */}
              <g filter="url(#il_blur)" opacity="0.88">
                <ellipse cx="72"  cy="35" rx="48" ry="20" fill="#fff"/>
                <ellipse cx="48"  cy="44" rx="33" ry="16" fill="#fff"/>
                <ellipse cx="98"  cy="44" rx="33" ry="16" fill="#fff"/>
              </g>
              <g filter="url(#il_blur)" opacity="0.55">
                <ellipse cx="210" cy="26" rx="36" ry="14" fill="#fff"/>
                <ellipse cx="188" cy="35" rx="26" ry="12" fill="#fff"/>
                <ellipse cx="234" cy="35" rx="26" ry="12" fill="#fff"/>
              </g>

              {/* Birds */}
              <path d="M130 55 Q135 49 140 55" stroke="#0c4a6e" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M150 44 Q156 38 162 44" stroke="#0c4a6e" strokeWidth="1.6" fill="none" strokeLinecap="round"/>

              {/* Sea */}
              <path d="M0 160 Q80 150 160 160 Q240 170 320 160 L320 240 L0 240 Z" fill="url(#il_sea)"/>
              <path d="M10 173 Q52 168 94 173"  stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none"/>
              <path d="M200 177 Q244 172 288 177" stroke="rgba(255,255,255,0.28)" strokeWidth="1.8" fill="none"/>

              {/* Sand */}
              <path d="M0 197 Q80 187 160 194 Q240 201 320 193 L320 240 L0 240 Z" fill="url(#il_sand)"/>

              {/* ══════════════════════════════════
                  SUITCASE  centred x:50-270, y:70-222
                  幅220 × 高152  ←大きく
                  ══════════════════════════════════ */}

              {/* Suitcase shadow */}
              <ellipse cx="160" cy="224" rx="90" ry="9" fill="rgba(0,0,0,0.18)" filter="url(#il_blur)"/>

              {/* Handle */}
              <path d="M102 84 L102 66 Q160 50 218 66 L218 84"
                fill="none" stroke="#3e1a04" strokeWidth="8" strokeLinecap="round"/>
              <rect x="96"  y="78" width="14" height="15" rx="5" fill="#3e1a04"/>
              <rect x="210" y="78" width="14" height="15" rx="5" fill="#3e1a04"/>

              {/* Body */}
              <rect x="50" y="84" width="220" height="138" rx="12"
                fill="url(#il_bag)" stroke="#5a2008" strokeWidth="2.5" filter="url(#il_drop)"/>

              {/* Lid separation */}
              <rect x="50" y="104" width="220" height="6" fill="rgba(0,0,0,0.22)"/>

              {/* Horizontal strap band */}
              <rect x="50" y="148" width="220" height="14" fill="rgba(0,0,0,0.22)"/>

              {/* Clasp */}
              <rect x="136" y="142" width="48" height="24" rx="6" fill="#d4af37" stroke="#b8860b" strokeWidth="2"/>
              <rect x="142" y="147" width="36" height="14" rx="4" fill="#b8860b"/>
              <rect x="149" y="151" width="22" height="6"  rx="2" fill="#8b6914"/>

              {/* Corner rivets */}
              <circle cx="62"  cy="95"  r="5.5" fill="#5a2008" stroke="#3e1a04" strokeWidth="1.2"/>
              <circle cx="258" cy="95"  r="5.5" fill="#5a2008" stroke="#3e1a04" strokeWidth="1.2"/>
              <circle cx="62"  cy="214" r="5.5" fill="#5a2008" stroke="#3e1a04" strokeWidth="1.2"/>
              <circle cx="258" cy="214" r="5.5" fill="#5a2008" stroke="#3e1a04" strokeWidth="1.2"/>

              {/* Shine */}
              <rect x="56" y="88" width="90" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>

              {/* ── STICKERS — clipped inside bag face ──
                  鞄面 x:50-270, y:84-222
                  上半(y84-148): 左=ITALIA(円r=26), 右=PARIS(56×44)
                  下半(y162-222): 左=GREECE(60×42), 右=TOKYO(50×50)
                  中央バンド(y148-162)とクラスプ周辺は避ける
              */}
              <g clipPath="url(#il_bagClip)">

                {/* ▶ STICKER 1: ITALIA — 円 r=26, center(97,121) */}
                <g transform="translate(97,121) rotate(-8)">
                  <circle r="26" fill="rgba(0,0,0,0.2)" transform="translate(2,3)"/>
                  <circle r="26" fill="#cc1a2e"/>
                  <circle r="26" fill="none" stroke="#fff" strokeWidth="3"/>
                  <circle r="22" fill="none" stroke="rgba(255,210,150,0.4)" strokeWidth="1"/>
                  <circle r="19" fill="#aa1020"/>

                  {/* Vespa — detailed */}
                  <ellipse cx="1"   cy="6"   rx="12"  ry="8"   fill="#e84055"/>
                  <ellipse cx="-1"  cy="1"   rx="6.5" ry="4"   fill="#880e1c"/>
                  <ellipse cx="-4.5" cy="0"  rx="3.5" ry="5.5" fill="rgba(180,228,255,0.82)" stroke="#ccc" strokeWidth="0.8"/>
                  <path d="M-9,1.5 Q-12,-4 -9,-7" stroke="#777" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="-9" cy="-7" r="2" fill="#444"/>
                  <path d="M12,8 Q15,9.5 15.5,14" stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  {/* front wheel */}
                  <circle cx="-12" cy="13" r="7" fill="#1a1a1a" stroke="#555" strokeWidth="1.2"/>
                  <circle cx="-12" cy="13" r="3.5" fill="#555"/>
                  <circle cx="-12" cy="13" r="1.4" fill="#bbb"/>
                  {/* rear wheel */}
                  <circle cx="12"  cy="13" r="7" fill="#1a1a1a" stroke="#555" strokeWidth="1.2"/>
                  <circle cx="12"  cy="13" r="3.5" fill="#555"/>
                  <circle cx="12"  cy="13" r="1.4" fill="#bbb"/>

                  {/* ITALIA arc */}
                  <path id="il_ia" d="M -21,0 A 21,21 0 0,1 21,0" fill="none"/>
                  <text fontFamily="Georgia,serif" fontWeight="bold" fontSize="7.5" fill="#fff" letterSpacing="2.5">
                    <textPath href="#il_ia" startOffset="10%">I T A L I A</textPath>
                  </text>
                  <circle cx="-7"  cy="23" r="1.6" fill="rgba(255,220,160,0.8)"/>
                  <circle cx="0"   cy="25" r="1.6" fill="rgba(255,220,160,0.8)"/>
                  <circle cx="7"   cy="23" r="1.6" fill="rgba(255,220,160,0.8)"/>
                </g>

                {/* ▶ STICKER 2: PARIS — 56×44, center(210,118) */}
                <g transform="translate(210,118) rotate(6)">
                  <rect x="-28" y="-22" width="56" height="44" rx="7" fill="rgba(0,0,0,0.2)" transform="translate(2,3)"/>
                  <rect x="-28" y="-22" width="56" height="44" rx="7" fill="#0d2860"/>
                  <rect x="-28" y="-22" width="56" height="44" rx="7" fill="none" stroke="#f5cc30" strokeWidth="3"/>
                  <rect x="-26" y="-20" width="52" height="30" rx="4" fill="#081a42"/>
                  {/* Eiffel Tower */}
                  <path d="M-7,18 L-14,18 L-9,5 Z"  fill="#7ab0d8"/>
                  <path d="M7,18  L14,18  L9,5  Z"   fill="#5e9ccc"/>
                  <rect x="-10" y="3"  width="20" height="3"   rx="0.6" fill="#9ac8e8"/>
                  <path d="M-7,3 L7,3 L4.5,-9 L-4.5,-9 Z"      fill="#7ab0d8"/>
                  <rect x="-5"  y="-11" width="10" height="2.5" rx="0.5" fill="#aad4f0"/>
                  <path d="M-3.5,-11 L3.5,-11 L2,-19 L-2,-19 Z" fill="#9ac8e8"/>
                  <path d="M-1.2,-19 L1.2,-19 L0,-26 Z"          fill="#cce8ff"/>
                  <circle cx="0" cy="-26" r="2" fill="#ffd700"/>
                  {/* lattice */}
                  <rect x="-7" y="-7"  width="14" height="1"   rx="0.4" fill="rgba(255,255,255,0.15)"/>
                  <rect x="-4" y="-16" width="8"  height="0.9" rx="0.3" fill="rgba(255,255,255,0.12)"/>
                  {/* stars */}
                  <circle cx="-21" cy="-13" r="1.4" fill="#f5cc30" opacity="0.9"/>
                  <circle cx="20"  cy="-9"  r="1.1" fill="#f5cc30" opacity="0.75"/>
                  <circle cx="-17" cy="-6"  r="0.9" fill="#f5cc30" opacity="0.65"/>
                  <circle cx="22"  cy="-17" r="0.8" fill="#f5cc30" opacity="0.55"/>
                  {/* PARIS banner */}
                  <rect x="-25" y="16" width="50" height="14" rx="4" fill="#f5cc30"/>
                  <text x="0" y="27" textAnchor="middle" fill="#0d2860" fontSize="10" fontWeight="bold"
                    fontFamily="Georgia,serif" letterSpacing="3">PARIS</text>
                </g>

                {/* ▶ STICKER 3: GREECE — 60×42, center(96,192) */}
                <g transform="translate(96,192) rotate(-5)">
                  <rect x="-30" y="-21" width="60" height="42" rx="7" fill="rgba(0,0,0,0.2)" transform="translate(2,3)"/>
                  <rect x="-30" y="-21" width="60" height="42" rx="7" fill="#1652a8"/>
                  <rect x="-30" y="-21" width="60" height="42" rx="7" fill="none" stroke="#fff" strokeWidth="3"/>
                  <rect x="-28" y="-19" width="56" height="24" rx="3" fill="#3b7fd4" opacity="0.5"/>
                  {/* Parthenon */}
                  <rect x="-22" y="5"   width="44" height="5"   rx="0.6" fill="#e8e0cc"/>
                  <rect x="-20" y="1.5" width="40" height="4"   rx="0.6" fill="#f0e8d8"/>
                  {[-17,-11.5,-6,-0.5,5,10.5,16].map((cx,i)=>(
                    <g key={i}>
                      <rect x={cx-2} y="-13" width="4" height="15.5" rx="1" fill="#f5f0e8"/>
                      <line x1={cx} y1="-13" x2={cx} y2="1.5" stroke="rgba(0,0,0,0.06)" strokeWidth="0.7"/>
                      <rect x={cx-2.5} y="-15" width="5" height="2"  rx="0.5" fill="#e8e0cc"/>
                    </g>
                  ))}
                  <rect x="-20" y="-18" width="40" height="5"   rx="0.6" fill="#e8e0cc"/>
                  <polygon points="-19,-18 19,-18 0,-30" fill="#ddd5bf"/>
                  <polygon points="-15,-18 15,-18 0,-27" fill="rgba(255,255,255,0.22)"/>
                  <text x="0" y="18" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold"
                    fontFamily="Georgia,serif" letterSpacing="2">GREECE</text>
                </g>

                {/* ▶ STICKER 4: TOKYO — 50×50, center(215,192) */}
                <g transform="translate(215,192) rotate(7)">
                  <rect x="-25" y="-25" width="50" height="50" rx="7" fill="rgba(0,0,0,0.2)" transform="translate(2,3)"/>
                  <rect x="-25" y="-25" width="50" height="50" rx="7" fill="#fce8e8"/>
                  <rect x="-25" y="-25" width="50" height="50" rx="7" fill="none" stroke="#dc2626" strokeWidth="3"/>
                  {/* sky */}
                  <rect x="-23" y="-23" width="46" height="30" rx="3" fill="#fef0f0"/>
                  {/* grass */}
                  <rect x="-23" y="7"  width="46" height="11" fill="#86efac"/>
                  <rect x="-23" y="11" width="46" height="7"  fill="#4ade80"/>
                  {/* Fuji */}
                  <polygon points="0,-22 -23,7 23,7"   fill="#cbd5e1"/>
                  <polygon points="0,-22 -15,-3 15,-3" fill="#e2e8f0"/>
                  <polygon points="0,-22 -8,-10 8,-10" fill="#f1f5f9"/>
                  <polygon points="0,-22 -4,-16 4,-16" fill="#fff"/>
                  {/* Torii */}
                  <rect x="-16" y="-2" width="32" height="4.5" rx="1.8" fill="#dc2626"/>
                  <rect x="-13" y="3.5" width="26" height="3"  rx="1.2" fill="#dc2626"/>
                  <rect x="-14.5" y="-2" width="4.5" height="20" rx="1.5" fill="#dc2626"/>
                  <rect x="10"    y="-2" width="4.5" height="20" rx="1.5" fill="#dc2626"/>
                  <rect x="-16.5" y="16" width="8"   height="3"  rx="1"   fill="#b91c1c"/>
                  <rect x="8.5"   y="16" width="8"   height="3"  rx="1"   fill="#b91c1c"/>
                  <text x="0" y="23" textAnchor="middle" fill="#dc2626" fontSize="8.5" fontWeight="bold"
                    fontFamily="Georgia,serif" letterSpacing="2">TOKYO</text>
                </g>

              </g>{/* end bagClip */}

            </svg>
          </div>
        </div>
      </div>

      {/* ──── TABS + FORM ──── */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 16px"}}>
        {/* Tab bar */}
        <div style={{display:"flex",gap:3,marginBottom:12,overflowX:"auto",paddingBottom:2,scrollbarWidth:"none"}}>
          {ITABS.map((t,i)=>(
            <button key={t} onClick={()=>setItab(i)}
              style={{padding:"7px 11px",borderRadius:8,border:"none",whiteSpace:"nowrap",flexShrink:0,
                background:itab===i?C.g600:"#fff",color:itab===i?"#fff":C.t2,
                fontSize:11,fontWeight:itab===i?700:500,
                boxShadow:itab===i?`0 1px 6px rgba(26,140,63,0.15)`:`0 1px 3px rgba(0,0,0,0.04)`}}>
              {t}
            </button>
          ))}
        </div>

        <Card>
          {/* ── TAB 0: 基本情報 ── */}
          {itab===0&&<>
            <SectionHead icon={<span style={{fontSize:20}}>👤</span>} title="基本情報" sub="あなたとパートナーの年齢・退職予定を入力してください"/>
            <div style={{marginBottom:12}}>
              <Lbl>お名前（任意）</Lbl>
              <input value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="田中 太郎"
                style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.bdr}`,
                  background:"#fff",color:C.t1,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:FONT}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[["現在の年齢","currentAge","歳",18,80],["リタイア希望","retireAge","歳",30,90],["想定寿命","lifeExpectancy","歳",60,110]].map(([l,k,u,mn,mx])=>(
                <div key={k}><Lbl>{l}</Lbl><Num value={form[k]} onChange={v=>setF(k,v)} unit={u} min={mn} max={mx}/></div>
              ))}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,padding:13,background:form.hasPartner?C.g100:C.muted,
              borderRadius:11,cursor:"pointer",border:`1.5px solid ${form.hasPartner?C.bdrS:C.bdr}`,marginBottom:form.hasPartner?12:0}}>
              <input type="checkbox" checked={form.hasPartner} onChange={e=>setF("hasPartner",e.target.checked)} style={{width:17,height:17}}/>
              <span style={{fontSize:13,fontWeight:600,color:C.t1}}>パートナー・配偶者がいる</span>
            </label>
            {form.hasPartner&&<div style={{background:C.muted,borderRadius:11,padding:14,border:`1px solid ${C.bdr}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><Lbl>パートナーの年齢</Lbl><Num value={form.partnerAge} onChange={v=>setF("partnerAge",v)} unit="歳" min={18} max={80}/></div>
                <div><Lbl>パートナーの退職予定</Lbl><Num value={form.partnerRetireAge} onChange={v=>setF("partnerRetireAge",v)} unit="歳" min={30} max={90}/></div>
              </div>
              {/* 専業主婦チェック */}
              <label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",
                background:form.p_isHousewife?C.goldL:C.card,borderRadius:9,cursor:"pointer",marginBottom:8,
                border:`1.5px solid ${form.p_isHousewife?C.gold:C.bdr}`}}>
                <input type="checkbox" checked={form.p_isHousewife} onChange={e=>setF("p_isHousewife",e.target.checked)} style={{width:16,height:16}}/>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:C.t1}}>専業主婦・主夫（収入なし）</span>
                  <div style={{fontSize:10,color:C.t3,marginTop:1}}>第3号被保険者として国民年金を自動設定します</div>
                </div>
              </label>
              {!form.p_isHousewife&&<div>
                <div style={{marginBottom:6}}>
                  <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,cursor:"pointer",color:C.t2}}>
                    <input type="checkbox" checked={pGrossMode} onChange={e=>setPGrossMode(e.target.checked)} style={{width:14,height:14}}/>
                    額面から計算する
                  </label>
                </div>
                {pGrossMode
                  ?<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center"}}>
                      <Num value={pGross} onChange={setPGross} unit="万円（額面）" step={10}/>
                      <div style={{fontSize:12,color:C.g700,fontWeight:700,whiteSpace:"nowrap"}}>→ {grossToNet(pGross)}万円</div>
                    </div>
                  :<><Lbl>パートナーの年収（手取り）</Lbl><Num value={form.p_income} onChange={v=>setF("p_income",v)} unit="万円" step={10}/></>}
              </div>}
            </div>}
          </>}

          {/* ── TAB 1: 資産 ── */}
          {itab===1&&<>
            <SectionHead icon={<span style={{fontSize:20}}>💳</span>} title="資産情報" sub="運用資金と生活防衛資金を分けて入力できます"/>
            {/* 生活防衛資金 */}
            <div style={{background:C.infoL,borderRadius:12,padding:14,marginBottom:12,border:`1px solid ${C.info}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.info,marginBottom:6}}>💡 運用資産と生活防衛資金を分けましょう</div>
              <div style={{fontSize:11,color:C.t2,lineHeight:1.8}}>
                <b>生活防衛資金</b>とは、株価暴落時などもしものときにしか手をつけない現金の緊急予備費です。生活費の6〜12ヶ月分が目安。<br/>
                シミュレーションは<b>運用資産のみ</b>を投資に回し、生活防衛資金は普通預金等で別途保管します。
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <Lbl tip="株式・投信・NISA・iDeCoなど実際に運用している資産の合計">運用する金融資産</Lbl>
                <Num value={form.investAsset} onChange={v=>setF("investAsset",v)} unit="万円" step={100}/>
              </div>
              <div>
                <Lbl tip="生活費の6〜12ヶ月分。現金・普通預金として別管理。投資しない。">生活防衛資金（現金）</Lbl>
                <Num value={form.emergencyFund} onChange={v=>setF("emergencyFund",v)} unit="万円" step={10}/>
              </div>
            </div>
            <div style={{background:C.g100,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13}}>
              金融資産合計: <b style={{color:C.g700}}>{fmtM(form.currentAsset)}</b>
              <span style={{fontSize:10,color:C.t3,marginLeft:8}}>（運用 {fmtMn(form.investAsset)} ＋ 防衛資金 {fmtMn(form.emergencyFund)}）</span>
            </div>
            {/* 暴落時オプション */}
            <label style={{display:"flex",alignItems:"flex-start",gap:10,padding:12,background:form.useEmergencyOnCrash?C.g100:C.muted,
              borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.useEmergencyOnCrash?C.bdrS:C.bdr}`,marginBottom:14}}>
              <input type="checkbox" checked={form.useEmergencyOnCrash} onChange={e=>setF("useEmergencyOnCrash",e.target.checked)} style={{width:16,height:16,marginTop:2}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.t1}}>暴落時（−15%以上）は生活防衛資金から補填する</div>
                <div style={{fontSize:10,color:C.t3,marginTop:2}}>シミュレーション上、暴落年は運用資産の取り崩しを50%削減し防衛資金で補填します</div>
              </div>
            </label>
            {/* 不動産 */}
            <label style={{display:"flex",alignItems:"center",gap:10,padding:13,
              background:form.hasHome?C.g100:C.muted,borderRadius:11,cursor:"pointer",
              marginBottom:form.hasHome?12:0,border:`1.5px solid ${form.hasHome?C.bdrS:C.bdr}`}}>
              <input type="checkbox" checked={form.hasHome} onChange={e=>setF("hasHome",e.target.checked)} style={{width:17,height:17}}/>
              <div>
                <span style={{fontSize:13,fontWeight:600,color:C.t1}}>持ち家・不動産がある</span>
                <div style={{fontSize:10,color:C.t3,marginTop:1}}>総資産に表示。FIRE判定は金融資産のみで行います。</div>
              </div>
            </label>
            {form.hasHome&&<div style={{background:C.muted,borderRadius:11,padding:14,border:`1px solid ${C.bdr}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>不動産の評価額</Lbl><Num value={form.homeValue} onChange={v=>setF("homeValue",v)} unit="万円" step={100}/></div>
                <div><Lbl>住宅ローン残債</Lbl><Num value={form.homeLoan} onChange={v=>setF("homeLoan",v)} unit="万円" step={100}/></div>
              </div>
              <div style={{background:C.card,borderRadius:8,padding:"9px 12px",marginTop:10,fontSize:12}}>
                不動産純資産: <b style={{color:C.g700}}>{fmtM(netHome)}</b>　総資産: <b style={{color:C.g900}}>{fmtM(totalAsset)}</b>
              </div>
            </div>}
          </>}

          {/* ── TAB 2: ファンド ── */}
          {itab===2&&<>
            <SectionHead icon={<span style={{fontSize:20}}>📈</span>} title="投資ファンド設定" sub="複数のファンドを組み合わせてポートフォリオを構築できます"/>
            <FundAllocEditor allocs={form.allocs} onChange={v=>setF("allocs",v)} customFunds={form.customFunds} onCustomFundsChange={v=>setF("customFunds",v)}/>
            <div style={{marginTop:14,background:C.infoL,borderRadius:11,padding:13,border:`1px solid ${C.info}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.info,marginBottom:6}}>📌 リスク（標準偏差）とは？</div>
              <div style={{fontSize:11,color:C.t2,lineHeight:1.85}}>
                投資の「ブレ幅」です。期待リターン7%・リスク17%なら、約68%の確率でリターンは<b>−10%〜+24%の範囲</b>に収まります。モンテカルロ法では{TRIALS}通りの未来を試算します。
              </div>
            </div>
          </>}

          {/* ── TAB 3: 収支 ── */}
          {itab===3&&<>
            <SectionHead icon={<span style={{fontSize:20}}>💰</span>} title="収入・支出" sub="手取りが分からない場合は額面から自動計算できます"/>
            <div style={{background:C.g100,borderRadius:11,padding:14,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:C.t1}}>世帯年収の入力</span>
                <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,cursor:"pointer",color:C.t2}}>
                  <input type="checkbox" checked={grossMode} onChange={e=>setGrossMode(e.target.checked)} style={{width:14,height:14}}/>額面から計算
                </label>
              </div>
              {grossMode
                ?<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center"}}>
                    <Num value={grossIncome} onChange={setGrossIncome} unit="万円（額面）" step={10}/>
                    <div style={{textAlign:"center",minWidth:70}}>
                      <div style={{fontSize:9,color:C.t3}}>推定手取り</div>
                      <div style={{fontSize:17,fontWeight:800,color:C.g700}}>{grossToNet(grossIncome)}万</div>
                    </div>
                  </div>
                :<><Lbl>世帯年収（手取り）</Lbl><Num value={form.annualIncome} onChange={v=>setF("annualIncome",v)} unit="万円" step={10}/></>
              }
            </div>
            <div style={{marginBottom:12}}><Lbl tip="毎月NISA・iDeCoなどに積み立てる額">月々の積立・投資額</Lbl><Num value={form.monthlyInvest} onChange={v=>setF("monthlyInvest",v)} unit="万円" min={0} max={200}/></div>
            <div style={{marginBottom:12}}><Lbl>現在の年間生活費</Lbl><Num value={form.annualExpense} onChange={v=>setF("annualExpense",v)} unit="万円" min={0} max={2000} step={10}/></div>
            <div style={{marginBottom:12}}><Lbl tip="年金以外に資産から取り崩す年間金額。現役時の70〜80%が目安。">リタイア後の年間取り崩し額</Lbl><Num value={form.annualWithdraw} onChange={v=>setF("annualWithdraw",v)} unit="万円" min={0} max={2000} step={10}/></div>
            <div style={{marginBottom:4}}><Lbl tip="サイドFIRE判定用。副業・パートの年間収入見込み。">副業・パート収入（年間）</Lbl><Num value={form.sideIncome} onChange={v=>setF("sideIncome",v)} unit="万円" min={0} max={1000} step={5}/></div>
          </>}

          {/* ── TAB 4: インフレ・税 ── */}
          {itab===4&&<>
            <SectionHead icon={<span style={{fontSize:20}}>📉</span>} title="インフレ・税金設定"/>
            {[{l:"低め",r:0.5,d:"平成デフレ期水準"},{l:"標準 ★",r:1.5,d:"2026年1月実績（推奨）"},
              {l:"やや高め",r:2.5,d:"2023〜2024年水準"},{l:"高め",r:3.5,d:"資産防衛モード"},
            ].map(p=>(
              <label key={p.r} style={{display:"flex",alignItems:"center",gap:12,borderRadius:10,
                border:`1.5px solid ${Math.abs(form.inflationRate-p.r)<0.01?C.g500:C.bdr}`,
                background:Math.abs(form.inflationRate-p.r)<0.01?C.g100:C.card,
                padding:"11px 14px",marginBottom:8,cursor:"pointer"}}>
                <input type="radio" name="inf" checked={Math.abs(form.inflationRate-p.r)<0.01} onChange={()=>setF("inflationRate",p.r)} style={{flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.t1}}>{p.l}</span>
                    <b style={{color:C.g700,fontSize:14}}>{p.r}%</b>
                  </div>
                  <div style={{fontSize:11,color:C.t3,marginTop:1}}>{p.d}</div>
                </div>
              </label>
            ))}
            <label style={{display:"flex",alignItems:"flex-start",gap:10,padding:13,
              background:form.applyTax?C.g100:C.muted,borderRadius:11,cursor:"pointer",
              border:`1.5px solid ${form.applyTax?C.bdrS:C.bdr}`,marginTop:4}}>
              <input type="checkbox" checked={form.applyTax} onChange={e=>setF("applyTax",e.target.checked)} style={{width:16,height:16,marginTop:2,flexShrink:0}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.t1}}>運用益に課税する（20.315%）</div>
                <div style={{fontSize:11,color:C.t3,marginTop:2}}>NISAをフル活用する場合はオフに。オフにするとNISA想定になります。</div>
              </div>
            </label>
          </>}

          {/* ── TAB 5: 年金 ── */}
          {itab===5&&<>
            <SectionHead icon={<span style={{fontSize:20}}>🎌</span>} title="年金設定" sub="本人・パートナーの年金、付加年金・任意加入・iDeCoも対応"/>
            <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:10}}>ご本人の年金</div>
            <div style={{background:C.g100,borderRadius:11,padding:13,marginBottom:12}}>
              {[{v:"kosei",l:"厚生年金（会社員・公務員）"},{v:"kokumin",l:"国民年金のみ（自営業等）"}].map(o=>(
                <label key={o.v} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",
                  borderBottom:o.v==="kosei"?`1px solid ${C.g200}`:"none",cursor:"pointer"}}>
                  <input type="radio" checked={form.pensionType===o.v} onChange={()=>setF("pensionType",o.v)}/>
                  <span style={{fontSize:13,color:C.t1}}>{o.l}</span>
                </label>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
              <div><Lbl>受給開始年齢</Lbl><Num value={form.pensionStartAge} onChange={v=>setF("pensionStartAge",v)} unit="歳" min={60} max={75}/></div>
              {form.pensionType==="kosei"&&<>
                <div><Lbl>厚生年金加入年数</Lbl><Num value={form.kosei_years} onChange={v=>setF("kosei_years",v)} unit="年" min={0} max={50}/></div>
                <div><Lbl>退職直前年収</Lbl><Num value={form.kosei_lastSalary} onChange={v=>setF("kosei_lastSalary",v)} unit="万円" step={10}/></div>
              </>}
            </div>
            {/* 付加年金 */}
            <label style={{display:"flex",alignItems:"flex-start",gap:9,padding:11,background:form.fuka_nenkin?C.g100:C.muted,
              borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.fuka_nenkin?C.bdrS:C.bdr}`,marginBottom:10}}>
              <input type="checkbox" checked={form.fuka_nenkin} onChange={e=>setF("fuka_nenkin",e.target.checked)} style={{width:15,height:15,marginTop:2}}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.t1}}>付加年金に加入（保険料+月200円）</div>
                <div style={{fontSize:10,color:C.t3,marginTop:1}}>自営業・早期退職後の国民年金加入者が利用可能。月200円の保険料追加で、受給時は<b style={{color:C.g700}}>月400円×加入月数</b>の年金が増額。2年で元が取れる高コスパ制度。</div>
              </div>
            </label>
            {/* 任意加入 */}
            {form.pensionType==="kosei"&&<div style={{marginBottom:12}}>
              <Lbl tip="早期退職後〜65歳まで国民年金に任意加入できます。加入期間を増やし受給額を上げられます。最大で退職年齢〜65歳まで。">退職後の国民年金任意加入年数</Lbl>
              <Num value={form.kokumin_extra} onChange={v=>setF("kokumin_extra",v)} unit="年" min={0} max={Math.max(0,65-form.retireAge)} step={1}/>
              <div style={{fontSize:10,color:C.t3,marginTop:3}}>上限: {Math.max(0,65-form.retireAge)}年（{form.retireAge}歳退職 → 65歳まで）</div>
            </div>}
            {/* iDeCo/確定拠出年金 */}
            <div style={{background:C.goldL,borderRadius:11,padding:13,border:`1px solid ${C.gold}33`,marginBottom:12}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:9,cursor:"pointer",marginBottom:form.ideco_active?12:0}}>
                <input type="checkbox" checked={form.ideco_active} onChange={e=>setF("ideco_active",e.target.checked)} style={{width:15,height:15,marginTop:2}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.gold}}>iDeCo（確定拠出年金）に加入</div>
                  <div style={{fontSize:10,color:C.t3,marginTop:1}}>掛金が全額所得控除。退職時に退職所得扱いで受取。</div>
                </div>
              </label>
              {form.ideco_active&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><Lbl>月額掛金</Lbl><Num value={form.ideco_monthly} onChange={v=>setF("ideco_monthly",v)} unit="万円" min={0.1} max={6.8} step={0.1}/></div>
                <div><Lbl>想定年率</Lbl><Num value={form.ideco_rate} onChange={v=>setF("ideco_rate",v)} unit="%" min={0} max={15} step={0.5}/></div>
                <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
                  <div>
                    <div style={{fontSize:10,color:C.t3}}>退職時試算</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.gold}}>{fmtM(pens.ideco_asset)}</div>
                  </div>
                </div>
              </div>}
            </div>
            {/* 年金サマリー */}
            <div style={{background:C.g100,borderRadius:11,padding:14,textAlign:"center",marginBottom:12,border:`1px solid ${C.g200}`}}>
              <div style={{fontSize:11,color:C.t3,marginBottom:3}}>ご本人の年金（月額・概算）</div>
              <div style={{fontSize:30,fontWeight:800,color:C.g800,fontFamily:SERIF}}>{Math.round(pens.total/12/MAN*10)/10}<span style={{fontSize:14,color:C.t3,fontFamily:FONT}}>万円/月</span></div>
              <div style={{fontSize:10,color:C.t3,marginTop:3}}>基礎 {Math.round(pens.base/MAN)}万/年　{pens.fuka>0?`+ 付加 ${Math.round(pens.fuka/MAN)}万/年　`:""}厚生 {Math.round(pens.kosei/MAN)}万/年</div>
            </div>
            {form.hasPartner&&<>
              <div style={{fontSize:13,fontWeight:700,color:C.t1,marginBottom:10}}>パートナーの年金</div>
              {form.p_isHousewife
                ?<div style={{background:C.muted,borderRadius:10,padding:12,fontSize:12,color:C.t2,marginBottom:10}}>
                    <div style={{fontWeight:700,color:C.g700,marginBottom:4}}>第3号被保険者として国民年金を自動計算（月額 約{Math.round(partnerPens.total/12/MAN*10)/10}万円）</div>
                    <div style={{fontSize:10,color:C.warn,background:C.warnL,borderRadius:7,padding:"7px 10px",border:`1px solid ${C.warn}33`}}>
                      ⚠️ あなたが厚生年金を脱退（早期退職・FIRE）した場合、配偶者も第3号から<b>第1号被保険者</b>へ切り替えが必要です。切り替え後は国民年金保険料（月約17,000円）が別途発生します。シミュレーションではこの追加保険料は支出に含めていないため、実際の支出計画では考慮してください。
                    </div>
                  </div>
                :<>
                  {/* 専業主婦チェックを外した直後は第1号（国民年金）がデフォルト */}
                  <div style={{background:C.infoL,borderRadius:10,padding:"9px 12px",marginBottom:10,fontSize:11,color:C.info,border:`1px solid ${C.info}33`}}>
                    💡 専業主婦チェックを外すと第1号（国民年金）に変わります。会社員の方は厚生年金を選択してください。
                  </div>
                  <div style={{background:C.g100,borderRadius:11,padding:13,marginBottom:12}}>
                    {[{v:"kokumin",l:"国民年金のみ（第1号・自営業など）"},{v:"kosei",l:"厚生年金（会社員・公務員）"}].map(o=>(
                      <label key={o.v} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:o.v==="kokumin"?`1px solid ${C.g200}`:"none",cursor:"pointer"}}>
                        <input type="radio" checked={form.p_pensionType===o.v} onChange={()=>setF("p_pensionType",o.v)}/>
                        <span style={{fontSize:13,color:C.t1}}>{o.l}</span>
                      </label>
                    ))}
                  </div>
                  {form.p_pensionType==="kosei"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    <div><Lbl>厚生年金加入年数</Lbl><Num value={form.p_kosei_years} onChange={v=>setF("p_kosei_years",v)} unit="年" min={0} max={50}/></div>
                    <div><Lbl>退職直前の年収</Lbl><Num value={form.p_salary} onChange={v=>setF("p_salary",v)} unit="万円" step={10}/></div>
                  </div>}
                </>}
              <div style={{background:`linear-gradient(135deg,${C.g100},#fff)`,borderRadius:11,padding:14,textAlign:"center",border:`1.5px solid ${C.g200}`}}>
                <div style={{fontSize:11,color:C.t3}}>世帯合計の年金（月額）</div>
                <div style={{fontSize:28,fontWeight:800,color:C.g700,fontFamily:SERIF}}>{Math.round(totalPensYr/12/MAN*10)/10}<span style={{fontSize:13,color:C.t3,fontFamily:FONT}}>万円/月</span></div>
              </div>
            </>}
          </>}

          {/* ── TAB 6: 子供 ── */}
          {itab===6&&<>
            <SectionHead icon={<span style={{fontSize:20}}>👶</span>} title="子供の教育費" sub="幼稚園〜大学まで公立/私立を選択して自動計算"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
              {[["幼稚園","公70/私158万"],["小学校","公211/私1,000万"],["中学校","公162/私430万"],
                ["高 校","公154/私315万"],["大(文系)","国243/私430万"],["大(医)","私立3,000万"]].map(([s,v])=>(
                <div key={s} style={{background:C.g100,borderRadius:8,padding:"7px 9px"}}>
                  <div style={{fontSize:9,color:C.t3}}>{s}</div>
                  <div style={{fontSize:10,fontWeight:600,color:C.t1}}>{v}</div>
                </div>
              ))}
            </div>
            {form.children.map((c,i)=>{
              const lvl = c.levels || {kg:"pub",el:"pub",jh:"pub",hs:"pub",univ:"pub"};
              return(
              <div key={c.id} style={{background:C.muted,borderRadius:13,padding:16,marginBottom:12,border:`1px solid ${C.bdr}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontWeight:700,color:C.t1,fontSize:14}}>{c.name||"子供"}</div>
                  <button onClick={()=>setF("children",form.children.filter((_,j)=>j!==i))}
                    style={{padding:"3px 9px",borderRadius:7,border:`1px solid ${C.err}44`,background:"transparent",color:C.err,fontSize:12,cursor:"pointer"}}>削除</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div><Lbl>名前</Lbl>
                    <input value={c.name||""} onChange={e=>{const arr=[...form.children];arr[i]={...c,name:e.target.value};setF("children",arr);}} placeholder="長男・長女など"
                      style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t1,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:FONT}}/>
                  </div>
                  <div><Lbl>誕生年</Lbl>
                    <Num value={c.birthYear||curYear} onChange={v=>{const arr=[...form.children];arr[i]={...c,birthYear:Math.round(v)};setF("children",arr);}} unit="年" min={1990} max={2045} step={1}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
                  {[["幼","kg",[["pub","公"],["pri","私"]]],["小","el",[["pub","公"],["pri","私"]]],
                    ["中","jh",[["pub","公"],["pri","私"]]],["高","hs",[["pub","公"],["pri","私"]]],
                    ["大","univ",[["pub","国"],["pri","私文"],["sci","私理"],["med","医"]]]
                  ].map(([lbl,fld,opts])=>(
                    <div key={fld}>
                      <div style={{fontSize:10,color:C.t3,marginBottom:3,textAlign:"center"}}>{lbl}</div>
                      <select value={lvl[fld]||opts[0][0]} onChange={e=>{const arr=[...form.children];arr[i]={...c,levels:{...lvl,[fld]:e.target.value}};setF("children",arr);}}
                        style={{width:"100%",padding:"5px 2px",borderRadius:7,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t1,fontSize:11,outline:"none",fontFamily:FONT,textAlign:"center"}}>
                        {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{background:C.card,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.t1}}>
                  教育費合計: <b style={{color:C.g700}}>{fmtM(childTotal(lvl))}</b>
                </div>
              </div>
              );
            })}
            <button onClick={()=>setF("children",[...form.children,{id:Date.now(),name:"",birthYear:curYear,levels:{kg:"pub",el:"pub",jh:"pub",hs:"pub",univ:"pub"}}])}
              style={{width:"100%",padding:11,borderRadius:10,border:`1.5px dashed ${C.bdrS}`,background:"transparent",color:C.g700,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              ＋ 子供を追加
            </button>
          </>}

          {/* ── TAB 7: 贈与・相続 ── */}
          {itab===7&&<>
            <SectionHead icon={<span style={{fontSize:20}}>🎁</span>} title="生前贈与・相続" sub="あげる側・もらう側どちらも対応"/>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[{k:"give",l:"🎁 あげる側"},{k:"receive",l:"💰 もらう側"},{k:"inherit",l:"🏛 親の遺産"}].map(tab=>{
                const a=(form._giftTab||"give")===tab.k;
                return (<button key={tab.k} onClick={()=>setF("_giftTab",tab.k)}
                  style={{flex:1,padding:10,borderRadius:10,border:`2px solid ${a?C.g500:C.bdr}`,
                    background:a?C.g100:C.muted,color:a?C.g800:C.t2,fontSize:13,fontWeight:700,cursor:"pointer"}}>{tab.l}</button>);
              })}
            </div>
            {(form._giftTab||"give")==="give"&&<>
              <div style={{background:C.infoL,borderRadius:11,padding:12,marginBottom:12,border:`1px solid ${C.info}33`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.info,marginBottom:4}}>📌 年間110万円まで贈与税なし（暦年贈与）</div>
                <div style={{fontSize:11,color:C.t2,lineHeight:1.8}}>2024年改正で相続開始前<b>7年以内</b>の贈与は相続財産に持ち戻しになりました。</div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:9,padding:12,background:form.giftActive?C.g100:C.muted,
                borderRadius:10,cursor:"pointer",marginBottom:form.giftActive?10:0,border:`1.5px solid ${form.giftActive?C.bdrS:C.bdr}`}}>
                <input type="checkbox" checked={form.giftActive} onChange={e=>setF("giftActive",e.target.checked)} style={{width:15,height:15}}/>
                <span style={{fontSize:13,fontWeight:600,color:C.t1}}>生前贈与プランを有効にする</span>
              </label>
              {form.giftActive&&<div style={{background:C.muted,borderRadius:11,padding:14,marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:8}}>
                  <div><Lbl tip="年110万円以下が非課税">1人あたり年間贈与額</Lbl><Num value={form.giftAmount} onChange={v=>setF("giftAmount",v)} unit="万円" step={10}/></div>
                  <div><Lbl>贈与する人数</Lbl><Num value={form.giftPeople} onChange={v=>setF("giftPeople",v)} unit="人" min={1} max={10}/></div>
                  <div><Lbl>贈与期間</Lbl><Num value={form.giftYears} onChange={v=>setF("giftYears",v)} unit="年" min={1} max={30}/></div>
                </div>
                <div style={{fontSize:12,color:C.t1,background:C.card,borderRadius:8,padding:"8px 12px"}}>
                  総贈与額: <b style={{color:C.g700}}>{fmtM(form.giftAmount*form.giftPeople*form.giftYears)}</b>
                </div>
              </div>}
            </>}
            {(form._giftTab||"give")==="receive"&&<>
              <label style={{display:"flex",alignItems:"center",gap:9,padding:12,background:form.giftReceiveActive?C.goldL:C.muted,
                borderRadius:10,cursor:"pointer",marginBottom:form.giftReceiveActive?10:0,border:`1.5px solid ${form.giftReceiveActive?C.gold:C.bdr}`}}>
                <input type="checkbox" checked={form.giftReceiveActive} onChange={e=>setF("giftReceiveActive",e.target.checked)} style={{width:15,height:15}}/>
                <span style={{fontSize:13,fontWeight:600,color:C.t1}}>生前贈与を受け取るプランを有効にする</span>
              </label>
              {form.giftReceiveActive&&<div style={{background:C.muted,borderRadius:11,padding:14,marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
                  <div><Lbl>年間受取額</Lbl><Num value={form.giftReceiveAmount} onChange={v=>setF("giftReceiveAmount",v)} unit="万円" step={10}/></div>
                  <div><Lbl>受取期間</Lbl><Num value={form.giftReceiveYears} onChange={v=>setF("giftReceiveYears",v)} unit="年" min={1} max={30}/></div>
                </div>
                <div style={{fontSize:12,color:C.t1,background:C.card,borderRadius:8,padding:"8px 12px"}}>
                  総受取額: <b style={{color:C.gold}}>{fmtM(form.giftReceiveAmount*form.giftReceiveYears)}</b>
                </div>
              </div>}
            </>}
            {(form._giftTab||"give")==="inherit"&&<>
              <div style={{background:C.warnL,borderRadius:11,padding:12,marginBottom:12,border:`1px solid ${C.warn}33`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.warn,marginBottom:4}}>📌 相続の基礎知識</div>
                <div style={{fontSize:11,color:C.t2,lineHeight:1.9}}>
                  法定相続分は原則として相続人で均等割り。兄弟姉妹がいれば人数で按分します。<br/>
                  <b style={{color:C.err}}>⚠️ 負の遺産（借金・連帯保証）がある場合、相続開始を知った日から3ヶ月以内に家庭裁判所へ相続放棄の申述が必要です。</b>
                </div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:9,padding:12,
                background:form.inheritReceiveActive?C.goldL:C.muted,
                borderRadius:10,cursor:"pointer",marginBottom:form.inheritReceiveActive?12:0,
                border:`1.5px solid ${form.inheritReceiveActive?C.gold:C.bdr}`}}>
                <input type="checkbox" checked={form.inheritReceiveActive} onChange={e=>setF("inheritReceiveActive",e.target.checked)} style={{width:15,height:15}}/>
                <span style={{fontSize:13,fontWeight:600,color:C.t1}}>親からの相続を見込む</span>
              </label>
              {form.inheritReceiveActive&&<div style={{background:C.muted,borderRadius:11,padding:14,marginBottom:12}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div><Lbl tip="親の財産総額（不動産含む）の概算">親の総遺産額（概算）</Lbl><Num value={form.inheritReceiveAmount} onChange={v=>setF("inheritReceiveAmount",v)} unit="万円" step={100}/></div>
                  <div><Lbl tip="相続が発生する予定年（親の推定没年）">相続発生予定年</Lbl><Num value={form.inheritReceiveYear} onChange={v=>setF("inheritReceiveYear",Math.round(v))} unit="年" min={2024} max={2090} step={1}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div><Lbl tip="あなた以外の兄弟姉妹の人数。0=一人っ子。遺産は人数+1で均等割り。">兄弟姉妹の人数</Lbl><Num value={form.inheritSiblings} onChange={v=>setF("inheritSiblings",Math.max(0,Math.round(v)))} unit="人（0=一人っ子）" min={0} max={10}/></div>
                  <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
                    <div>
                      {(()=>{
                        const sh=Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1));
                        const tax=inheritTax(sh,form.inheritSiblings+1);
                        const net=Math.max(0,sh-tax);
                        return(<>
                          <div style={{fontSize:10,color:C.t3}}>法定取り分（税引前）</div>
                          <div style={{fontSize:14,fontWeight:700,color:C.t2,fontFamily:SERIF}}>{fmtM(sh)}</div>
                          <div style={{fontSize:10,color:C.err}}>相続税: −{fmtM(tax)}</div>
                          <div style={{fontSize:10,color:C.t3}}>基礎控除: {(3000+600*(form.inheritSiblings+1)).toLocaleString()}万円</div>
                          <div style={{fontSize:17,fontWeight:800,color:C.ok,fontFamily:SERIF}}>手取り {fmtM(net)}</div>
                        </>);
                      })()}
                    </div>
                  </div>
                </div>
                {/* 投資割合 */}
                <div style={{background:C.card,borderRadius:10,padding:"10px 14px",marginBottom:10,border:`1px solid ${C.bdr}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.t1,marginBottom:8}}>💹 相続金の運用プラン</div>
                  <div style={{fontSize:11,color:C.t3,marginBottom:10,lineHeight:1.7}}>
                    受け取った相続金のうち何割を投資に回しますか？残りは現金（生活防衛資金）として保管されます。
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"center",marginBottom:6}}>
                    <input type="range" min={0} max={100} step={10} value={form.inheritInvestRatio||50}
                      onChange={e=>setF("inheritInvestRatio",parseInt(e.target.value))}
                      style={{accentColor:C.g600}}/>
                    <div style={{fontSize:16,fontWeight:800,color:C.g700,width:40,textAlign:"right"}}>{form.inheritInvestRatio||50}%</div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:C.g700}}>投資: <b>{fmtM(Math.round(Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1))*(form.inheritInvestRatio||50)/100))}</b></span>
                    <span style={{color:C.t3}}>現金保管: <b>{fmtM(Math.round(Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1))*(1-(form.inheritInvestRatio||50)/100)))}</b></span>
                  </div>
                </div>
                <div style={{background:C.card,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.t2,marginBottom:10}}>
                  {form.inheritReceiveYear}年（あなた {form.currentAge+(form.inheritReceiveYear-new Date().getFullYear())}歳）に <b style={{color:C.gold}}>{fmtM(Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1)))}</b> を受け取る想定でシミュレーションに反映します。
                </div>
                {/* 負の遺産 */}
                <label style={{display:"flex",alignItems:"flex-start",gap:9,padding:11,
                  background:form.inheritHasDebt?C.errL:C.card,
                  borderRadius:9,cursor:"pointer",border:`1.5px solid ${form.inheritHasDebt?C.err:C.bdr}`}}>
                  <input type="checkbox" checked={form.inheritHasDebt} onChange={e=>setF("inheritHasDebt",e.target.checked)} style={{width:15,height:15,marginTop:2}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.t1}}>負の遺産（借金・連帯保証債務）がある</div>
                    <div style={{fontSize:10,color:C.t3,marginTop:1}}>チェックすると相続放棄の注意喚起が表示されます</div>
                  </div>
                </label>
                {form.inheritHasDebt&&<>
                  <div style={{marginTop:10}}><Lbl>負の遺産の額</Lbl><Num value={form.inheritDebtAmount} onChange={v=>setF("inheritDebtAmount",v)} unit="万円" step={100}/></div>
                  <div style={{marginTop:10,background:C.errL,borderRadius:10,padding:"12px 14px",border:`1.5px solid ${C.err}66`}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.err,marginBottom:6}}>🚨 相続放棄を検討してください</div>
                    <div style={{fontSize:11,color:C.err,lineHeight:1.9}}>
                      負の遺産が資産を上回る場合、<b>相続開始を知った日から3ヶ月以内</b>に家庭裁判所へ<b>相続放棄の申述</b>を行うことで、借金を引き継がずに済みます。<br/>
                      期限を過ぎると原則として単純承認（全財産・全債務を引き継ぎ）となります。早めに弁護士・司法書士にご相談ください。
                    </div>
                    <div style={{marginTop:8,fontSize:11,color:C.t3}}>
                      遺産 {fmtM(Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1)))} ／ 債務按分 {fmtM(Math.round(form.inheritDebtAmount/(form.inheritSiblings+1)))} →
                      差引 <b style={{color:Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1))-Math.round(form.inheritDebtAmount/(form.inheritSiblings+1))>=0?C.ok:C.err}}>
                        {fmtM(Math.round(form.inheritReceiveAmount/(form.inheritSiblings+1))-Math.round(form.inheritDebtAmount/(form.inheritSiblings+1)))}
                      </b>
                    </div>
                  </div>
                </>}
              </div>}
            </>}
          </>}

          {/* ── TAB 8: ライフイベント ── */}
          {itab===8&&<>
            <SectionHead icon={<span style={{fontSize:20}}>📅</span>} title="ライフイベント" sub="発生年の入力で家族全員の年齢が自動表示されます"/>
            {form.lifeEvents.map((ev,i)=>{
              // 発生時の家族年齢を計算
              const yDiff=ev.year-curYear;
              const ages=["本人:"+(form.currentAge+yDiff)+"歳",
                form.hasPartner?"パートナー:"+(form.partnerAge+yDiff)+"歳":null,
                ...form.children.map((c,ci)=>(c.name||`子供${ci+1}`)+":"+(ev.year-c.birthYear)+"歳")
              ].filter(Boolean).join("　");
              return(
                <div key={ev.id} style={{background:C.muted,borderRadius:12,padding:13,marginBottom:10,border:`1px solid ${C.bdr}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <select value={ev.type} onChange={e=>{const evs=[...form.lifeEvents];evs[i]={...ev,type:e.target.value};setF("lifeEvents",evs);}}
                      style={{padding:"7px 9px",borderRadius:8,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t1,fontSize:13,outline:"none",fontFamily:FONT,flex:1,marginRight:8}}>
                      {[["housing","🏠 住宅購入"],["car","🚗 車"],["wedding","💍 結婚"],["travel","✈️ 旅行・留学"],
                        ["renovation","🔨 リフォーム"],["funeral","⚫ 葬式"],["care","👴 介護費用"],["other","📦 その他"]].map(([v,l])=>(
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button onClick={()=>setF("lifeEvents",form.lifeEvents.filter((_,j)=>j!==i))}
                      style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${C.err}44`,background:"transparent",color:C.err,fontSize:12,cursor:"pointer"}}>削除</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:6}}>
                    <div><Lbl>発生年</Lbl><Num value={ev.year} onChange={v=>{const evs=[...form.lifeEvents];evs[i]={...ev,year:v};setF("lifeEvents",evs);}} unit="年" min={curYear} max={2090} step={1}/></div>
                    <div><Lbl>費用</Lbl><Num value={ev.cost} onChange={v=>{const evs=[...form.lifeEvents];evs[i]={...ev,cost:v};setF("lifeEvents",evs);}} unit="万円" step={10}/></div>
                  </div>
                  {ages&&<div style={{fontSize:10,color:C.t3,background:C.card,borderRadius:6,padding:"5px 9px"}}>{ev.year}年時点: {ages}</div>}
                </div>
              );
            })}
            <button onClick={()=>setF("lifeEvents",[...form.lifeEvents,{id:Date.now(),type:"other",year:curYear+2,cost:100}])}
              style={{width:"100%",padding:11,borderRadius:10,border:`1.5px dashed ${C.bdrS}`,background:"transparent",color:C.g700,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              ＋ イベントを追加
            </button>
          </>}
        </Card>

        {/* Nav */}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          {itab>0&&<button onClick={()=>setItab(t=>t-1)}
            style={{padding:"10px 20px",borderRadius:10,border:`1.5px solid ${C.bdr}`,background:"#fff",color:C.t2,fontSize:13,cursor:"pointer"}}>← 前へ</button>}
          {itab<ITABS.length-1
            ?<button onClick={()=>setItab(t=>t+1)}
                style={{marginLeft:"auto",padding:"11px 26px",borderRadius:10,border:"none",
                  background:`linear-gradient(135deg,${C.g700},${C.g600})`,color:"#fff",fontSize:14,
                  fontWeight:700,cursor:"pointer",boxShadow:`0 2px 8px rgba(14,107,46,0.15)`}}>次へ →</button>
            :<button onClick={run}
                style={{marginLeft:"auto",padding:"15px 36px",borderRadius:12,border:"none",
                  background:`linear-gradient(135deg,${C.fire} 0%,#c2410c 45%,${C.g600} 100%)`,
                  color:"#fff",fontSize:16,fontWeight:900,letterSpacing:0.5,
                  boxShadow:`0 3px 12px rgba(232,84,10,0.22)`}}>
                🔥 FIRE診断スタート！
              </button>
          }
        </div>

        {/* 免責事項 */}
        <div style={{marginTop:20,background:"#fff",borderRadius:12,padding:14,border:`1px solid ${C.bdr}`,fontSize:10,color:C.t3,lineHeight:1.8}}>
          <div style={{fontWeight:700,color:C.t2,marginBottom:5}}>⚠️ 免責事項</div>
          本シミュレーションは一般的な情報提供を目的としたものであり、投資助言・税務相談・ファイナンシャルプランニングの提供ではありません。
          計算結果は入力値とモデルに基づく概算であり、将来の実際の運用成果・税額・年金受給額を保証するものではありません。
          投資には元本割れリスクがあります。資産運用・年金・税務・相続に関する重要な意思決定は、ファイナンシャルプランナー（FP）・税理士・社会保険労務士等の専門家にご相談ください。
          年金試算は2025年時点の制度に基づく簡易計算であり、実際の受給額は日本年金機構の「ねんきん定期便」等でご確認ください。
        </div>
      </div>
    </div>
  );

  /* ══════════ REPORT PAGE ══════════ */
  const {mcPre,mcPost,lifecycle,fireDiag,tier,totalTier,pct,retireA,estateAtDeath,inheritT,inheritReceiveTax,inheritReceived,inheritShare,inheritDebtShare,inheritNetShare}=results;
  const rPens=calcPens(form); const rPP=calcPartnerPens(form);
  const postSurv=Math.round((mcPost.surv[mcPost.surv.length-1]/TRIALS)*100);
  const rTotPens=rPens.total+(form.hasPartner?rPP.total:0);
  const allF2=getAllFunds(form.customFunds);
  const pieD=form.allocs.map(a=>({name:allF2.find(f=>f.id===a.id)?.name||"",value:a.pct,color:allF2.find(f=>f.id===a.id)?.color||C.g500}));

  // Chart data
  const lcD=lifecycle.filter((_,i)=>i%2===0||i===lifecycle.length-1).map((d,i)=>{
    const yi=Math.min(i*2,mcPre.median.length-1);
    return {...d,label:`${d.age}歳`,
      p90:Math.round(toM(mcPost.p90[Math.max(0,yi-lifecycle.length/2)]||mcPre.p90[yi]||0)),
      p75:Math.round(toM(mcPre.p75[yi]||0)),p25:Math.round(toM(mcPre.p25[yi]||0)),
      p10:Math.round(toM(mcPre.p10[yi]||0))};
  });
  const surPostD=mcPost.surv.map((s,i)=>({label:`${form.retireAge+i}歳`,rate:Math.round(s/TRIALS*100)}));
  // Monte carlo scenarios
  const retireYrs=form.lifeExpectancy-form.retireAge;
  const medianFinal=Math.round(toM(mcPost.median[mcPost.median.length-1]||0));
  const bestFinal  =Math.round(toM(mcPost.p90[mcPost.p90.length-1]||0));
  const worstFinal =Math.round(toM(mcPost.p10[mcPost.p10.length-1]||0));

  // 余剰資金でできること
  const surplus=Math.max(0,medianFinal-form.annualWithdraw*10);
  const affordableItems=LUXURY_ITEMS.filter(it=>it.price<=surplus).sort((a,b)=>b.price-a.price);

  // 最悪ケース対策シミュレーション（二分探索）
  function findSafeWithdraw(targetSurv=80){
    let lo=0, hi=form.annualWithdraw, best=0;
    for(let iter=0;iter<20;iter++){
      const mid=(lo+hi)/2;
      const preYrs2=Math.max(0,form.retireAge-form.currentAge);
      const totYrs2=Math.max(preYrs2,form.lifeExpectancy-form.currentAge);
      const pensStartPost2=form.pensionStartAge-form.retireAge;
      const mc=runMC({asset0:toY(form.investAsset||form.currentAsset),investYr:0,withdrawYr:toY(mid),
        years:totYrs2-preYrs2,rate:blend.rate,risk:blend.risk,
        evYen:[],pensYr:totalPensYr,pensStartY:Math.max(0,pensStartPost2),applyTax:form.applyTax});
      const surv=Math.round(mc.surv[mc.surv.length-1]/TRIALS*100);
      if(surv>=targetSurv){best=mid;lo=mid;}else{hi=mid;}
    }
    return Math.floor(best);
  }
  function findSafeSideIncome(targetSurv=80){
    let lo=0, hi=form.annualWithdraw, best=hi;
    for(let iter=0;iter<20;iter++){
      const mid=(lo+hi)/2;
      const preYrs2=Math.max(0,form.retireAge-form.currentAge);
      const totYrs2=Math.max(preYrs2,form.lifeExpectancy-form.currentAge);
      const pensStartPost2=form.pensionStartAge-form.retireAge;
      const mc=runMC({asset0:toY(form.investAsset||form.currentAsset),investYr:0,withdrawYr:toY(form.annualWithdraw-mid),
        years:totYrs2-preYrs2,rate:blend.rate,risk:blend.risk,
        evYen:[],pensYr:totalPensYr,pensStartY:Math.max(0,pensStartPost2),applyTax:form.applyTax});
      const surv=Math.round(mc.surv[mc.surv.length-1]/TRIALS*100);
      if(surv>=targetSurv){best=mid;hi=mid;}else{lo=mid;}
    }
    return Math.ceil(best);
  }
  const safeWithdraw = worstFinal <= 0 ? findSafeWithdraw(80) : null;
  const safeSideIncome = worstFinal <= 0 ? findSafeSideIncome(80) : null;

  return(
    <div id="report-root" style={{fontFamily:FONT,background:C.bg,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;900&family=Shippori+Mincho:wght@500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{font-family:'Noto Sans JP','Hiragino Kaku Gothic Pro',sans-serif;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        input,select,textarea,button{font-family:'Noto Sans JP','Hiragino Kaku Gothic Pro',sans-serif!important;}
        @media print{.noprint{display:none!important;} body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:${C.g300};border-radius:4px;}
      `}</style>

      {/* Sticky header */}
      <div className="noprint" style={{background:"linear-gradient(135deg,#14532d,#166534)",padding:"12px 18px",
        display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,
        boxShadow:"0 1px 8px rgba(0,0,0,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Logo s={28}/>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#f0fdf4",fontFamily:SERIF}}>{form.name?`${form.name} さんの`:""}FIREプラン</div>
            <div style={{fontSize:10,color:"#bbf7d0"}}>{form.currentAge}歳 ／ {blend.rate}%運用</div>
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{
            const el=document.getElementById("report-root");
            if(el) el.style.overflow="visible";
            try{ window.print(); }
            catch(e){ alert("キーボードショートカット Ctrl+P（Mac: ⌘+P）で印刷ダイアログを開いてください。"); }
          }} style={{padding:"5px 11px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",
            background:"rgba(255,255,255,0.07)",color:"#bbf7d0",fontSize:11,fontWeight:600,cursor:"pointer"}}>📄 印刷/PDF</button>
          <button onClick={()=>{setPage("input");}} style={{padding:"6px 14px",borderRadius:8,border:"none",
            background:C.g500,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",
            boxShadow:`0 1px 6px rgba(45,145,86,0.2)`}}>← 再計算</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="noprint" style={{background:"#fff",borderBottom:`1px solid ${C.bdr}`,display:"flex",
        overflowX:"auto",scrollbarWidth:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        {RTABS.map(t=>(
          <button key={t.id} onClick={()=>setRtab(t.id)}
            style={{padding:"12px 14px",border:"none",background:"transparent",whiteSpace:"nowrap",flexShrink:0,
              borderBottom:`3px solid ${rtab===t.id?C.fire:"transparent"}`,
              color:rtab===t.id?C.t1:C.t3,fontSize:12,fontWeight:rtab===t.id?700:500,cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"20px 16px"}}>

        {/* ── OVERVIEW ── */}
        {rtab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:14}}>
            <Stat label="金融資産" value={fmtM(form.currentAsset)} sub={getTier(form.currentAsset).label} icon="💳" color={C.g700}/>
            {form.hasHome&&<Stat label="不動産純資産" value={fmtM(netHome)} sub={`評価${fmtMn(form.homeValue)}−残債${fmtMn(form.homeLoan)}`} icon="🏠" color={C.g600}/>}
            <Stat label="総資産" value={fmtM(totalAsset)} sub={getTier(totalAsset).label} icon="📊" color={C.t1}/>
            <Stat label={`${form.lifeExpectancy}歳まで資産継続`} value={`${postSurv}%`} big
              sub={`モンテカルロ${TRIALS}回試算`} icon="🎲" color={postSurv>=80?C.ok:postSurv>=50?C.warn:C.err}/>
          </div>

          {/* FIRE achievement banner */}
          {fireDiag.filter(f=>f.achieved).length>0&&(
            <div style={{background:"linear-gradient(135deg,#14532d,#166534)",border:`1.5px solid ${C.fire}`,
              borderRadius:18,padding:"18px 22px",marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{fontSize:30}}>🔥</span>
                <div>
                  <div style={{fontSize:17,fontWeight:800,color:"#f0fdf4",fontFamily:SERIF}}>
                    {fireDiag.filter(f=>f.achieved).map(f=>f.label).join(" · ")} の水準に達しています！
                  </div>
                  <div style={{fontSize:11,color:"#86efac",marginTop:2}}>おめでとうございます。経済的自立への道を歩んでいます。</div>
                </div>
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {fireDiag.filter(f=>f.achieved).map(f=>(
                  <div key={f.key} style={{background:"rgba(255,255,255,0.08)",borderRadius:9,padding:"7px 13px",border:`1px solid ${f.color}44`}}>
                    <span style={{fontSize:12,fontWeight:700,color:f.color}}>✓ {f.label}</span>
                    <span style={{fontSize:10,color:"#86efac",marginLeft:6}}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {postSurv<50&&<div style={{padding:"13px 17px",borderRadius:13,marginBottom:12,display:"flex",gap:11,
            background:C.errL,border:`1.5px solid ${C.err}44`,alignItems:"flex-start"}}>
            <span style={{fontSize:22}}>⚠️</span>
            <div>
              <div style={{fontWeight:700,color:C.err,fontSize:14,marginBottom:1}}>資産生存率が低い水準です</div>
              <div style={{fontSize:12,color:C.err}}>老後の資産生存率が{postSurv}%です。取り崩し額を減らすか、リタイア年齢の延長を検討してください。</div>
            </div>
          </div>}

          <Card>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>資産推移（シナリオ帯）</div>
            <div style={{fontSize:11,color:C.t3,marginBottom:14}}>年金・税金・教育費・ライフイベント考慮済み</div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={lcD}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.g400} stopOpacity={0.22}/>
                    <stop offset="100%" stopColor={C.g400} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
                <XAxis dataKey="label" tick={{fill:C.t3,fontSize:10}} interval={Math.floor(lcD.length/6)}/>
                <YAxis tickFormatter={v=>`${v}万`} tick={{fill:C.t3,fontSize:10}}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine x={`${form.retireAge}歳`} stroke={C.warn} strokeDasharray="4 4" label={{value:"退職",fill:C.warn,fontSize:10}}/>
                <Area type="monotone" dataKey="p75" fill={C.g200} stroke="none" name="良いケース"/>
                <Area type="monotone" dataKey="asset" fill="url(#ag)" stroke={C.g600} strokeWidth={2.5} name="中央値"/>
                <Area type="monotone" dataKey="p25" fill="#fff" stroke="none" name="悪いケース"/>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </>}

        {/* ── MONTE CARLO ── */}
        {rtab==="monte"&&<>
          <Card style={{background:C.infoL,border:`1px solid ${C.info}33`,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:C.info,marginBottom:6}}>🎲 モンテカルロシミュレーション（{TRIALS}回）について</div>
            <div style={{fontSize:12,color:C.t2,lineHeight:1.9}}>
              毎年の投資リターンをランダムに{TRIALS}通り試算します。500回→±5%の誤差、{TRIALS}回→<b>±3.5%の誤差</b>で結果の確実性が向上しています。<br/>
              「生存率90%」= {TRIALS}通りのうち900通りで{form.lifeExpectancy}歳まで資産が持ちました。<b>80%以上が安心ライン</b>です。
            </div>
          </Card>

          {/* 3シナリオ比較 */}
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>3つのシナリオ比較（{form.lifeExpectancy}歳時点の資産残高）</div>
            <div style={{fontSize:11,color:C.t3,marginBottom:14}}>年{form.annualWithdraw}万円取り崩し ＋ 年金{Math.round(rTotPens/MAN)}万円/年</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
              {[
                {label:"最良のケース",sub:"上位10%シナリオ",val:bestFinal,color:C.ok,icon:"🌟"},
                {label:"中央値",sub:"500通りの中央",val:medianFinal,color:C.g700,icon:"📊"},
                {label:"最悪のケース",sub:"下位10%シナリオ",val:worstFinal,color:worstFinal>0?C.warn:C.err,icon:"⚠️"},
              ].map(s=>(
                <div key={s.label} style={{background:s.color+"0d",borderRadius:13,padding:"14px 16px",border:`1px solid ${s.color}33`,textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:10,color:C.t3,marginBottom:8}}>{s.sub}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.color,fontFamily:SERIF}}>{s.val>0?`${s.val.toLocaleString()}万`:s.val===0?"0":"資産枯渇"}</div>
                </div>
              ))}
            </div>

            {/* 最悪ケース対策提案 */}
            {worstFinal<=0&&safeWithdraw!==null&&<div style={{background:C.errL,borderRadius:14,padding:16,marginBottom:16,border:`1.5px solid ${C.err}44`}}>
              <div style={{fontSize:13,fontWeight:800,color:C.err,marginBottom:10}}>⚠️ 最悪シナリオ対策 — どちらかで80%安全ラインに到達</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:`1px solid ${C.err}22`}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:4}}>💸 取り崩しをこの額に減らす</div>
                  <div style={{fontSize:22,fontWeight:900,color:C.err,fontFamily:SERIF}}>{safeWithdraw}万円/年</div>
                  <div style={{fontSize:10,color:C.t3,marginTop:3}}>現在より <b style={{color:C.err}}>{form.annualWithdraw-safeWithdraw}万円/年</b> 削減</div>
                </div>
                <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:`1px solid ${C.warn}22`}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:4}}>💼 副業・パートでこの額を稼ぐ</div>
                  <div style={{fontSize:22,fontWeight:900,color:C.warn,fontFamily:SERIF}}>{safeSideIncome}万円/年</div>
                  <div style={{fontSize:10,color:C.t3,marginTop:3}}>月換算 <b style={{color:C.warn}}>{Math.ceil(safeSideIncome/12)}万円/月</b></div>
                </div>
              </div>
            </div>}

            {/* 余剰資金でできること */}
            {surplus>0&&<>
              <div style={{fontSize:13,fontWeight:800,color:C.t1,marginBottom:10}}>
                💎 中央値シナリオの余剰資金 <span style={{color:C.g700,fontFamily:SERIF}}>{surplus.toLocaleString()}万円</span> でできること
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {affordableItems.slice(0,10).map(it=>{
                  const catBg={"旅行":"#eff6ff","ファッション":"#fdf2f8","美容":"#fdf2f8","グルメ":"#fff7ed","時計":"#fffbeb","不動産":"#f0fdf4","車":"#f8fafc","生活":"#f5f3ff","教育":"#ecfdf5"}[it.cat]||"#f8fafc";
                  const catCol={"旅行":"#0369a1","ファッション":"#be185d","美容":"#be185d","グルメ":"#c2410c","時計":"#92400e","不動産":"#15803d","車":"#334155","生活":"#6d28d9","教育":"#065f46"}[it.cat]||"#374151";
                  return(
                  <div key={it.name} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",
                    background:"#fff",borderRadius:12,border:`1.5px solid ${catCol}18`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:catBg,
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>
                      {it.icon}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:10,color:catCol,fontWeight:700,marginBottom:1}}>{it.cat}</div>
                      <div style={{fontSize:11,fontWeight:700,color:C.t1,lineHeight:1.3}}>{it.name}</div>
                      <div style={{fontSize:11,color:C.g600,fontWeight:800,marginTop:1}}>{it.price.toLocaleString()}万円</div>
                    </div>
                  </div>
                  );
                })}
              </div>
              {surplus>0&&affordableItems.length===0&&<div style={{fontSize:12,color:C.t3,padding:10}}>
                余剰資金が少ないため贅沢品の表示はありませんが、旅行や趣味に充てられます。
              </div>}
            </>}
          </Card>

          {/* Survival chart */}
          <Card>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>老後の資産生存率</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
              <div style={{fontSize:44,fontWeight:900,color:postSurv>=80?C.ok:postSurv>=50?C.warn:C.err,fontFamily:SERIF}}>{postSurv}%</div>
              <div style={{fontSize:12,color:C.t3}}>{form.lifeExpectancy}歳まで資産が続く確率</div>
            </div>
            <Prog val={postSurv} color={postSurv>=80?C.ok:postSurv>=50?C.warn:C.err} h={10}/>
            <ResponsiveContainer width="100%" height={200} style={{marginTop:16}}>
              <AreaChart data={surPostD}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={postSurv>=80?C.g500:C.warn} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={postSurv>=80?C.g500:C.warn} stopOpacity={0.02}/>
                </linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
                <XAxis dataKey="label" tick={{fill:C.t3,fontSize:10}} interval={Math.floor(surPostD.length/5)}/>
                <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fill:C.t3,fontSize:10}}/>
                <Tooltip formatter={v=>[`${v}%`,"生存率"]} contentStyle={{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:10}}/>
                <ReferenceLine y={80} stroke={C.ok} strokeDasharray="4 4" label={{value:"80% 安心ライン",fill:C.ok,fontSize:10}}/>
                <Area type="monotone" dataKey="rate" stroke={postSurv>=80?C.g600:C.warn} fill="url(#sg)" strokeWidth={2.5} dot={false} name="生存率"/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>}

        {/* ── FUND DETAIL ── */}
        {rtab==="fund"&&<>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:16}}>現在のポートフォリオ配分</div>
            <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
              <PieChart width={180} height={180}>
                <Pie data={pieD} cx={90} cy={90} outerRadius={76} dataKey="value"
                  label={({name,value})=>value+"%"} labelLine={false} labelStyle={{fontSize:9,fill:C.t3}}>
                  {pieD.map((d,i)=><Cell key={i} fill={d.color||C.g500}/>)}
                </Pie>
              </PieChart>
              <div style={{flex:1}}>
                {form.allocs.map(a=>{
                  const f=allF2.find(fn=>fn.id===a.id); if(!f)return null;
                  return(
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:f.color,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.t1}}>{f.name}</div>
                        <div style={{fontSize:10,color:C.t3}}>年率{f.rate}% ｜ リスク{f.risk}%</div>
                        <Prog val={a.pct} color={f.color} h={5}/>
                      </div>
                      <div style={{fontSize:16,fontWeight:800,color:f.color,width:38,textAlign:"right"}}>{a.pct}%</div>
                    </div>
                  );
                })}
                <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.t3}}>ブレンド期待リターン</span>
                  <b style={{fontSize:18,fontWeight:800,color:C.g700}}>{blend.rate}%</b>
                </div>
              </div>
            </div>
          </Card>
          {allF2.filter(f=>form.allocs.find(a=>a.id===f.id)).map(f=>(
            <Card key={f.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:f.color}}/>
                    <div style={{fontSize:14,fontWeight:700,color:C.t1}}>{f.name}</div>
                  </div>
                  <div style={{fontSize:11,color:C.t2,lineHeight:1.6,paddingLeft:16}}>{f.desc}</div>
                </div>
                <div style={{fontSize:22,fontWeight:900,color:f.color,fontFamily:SERIF,marginLeft:12}}>{f.rate}%</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingLeft:16}}>
                {[["1年実績",f.ret.y1],["3年(年率)",f.ret.y3],["5年(年率)",f.ret.y5],["長期平均★",f.ret.long]].map(([l,v])=>v&&(
                  <div key={l} style={{background:l.includes("★")?C.g100:C.muted,padding:"4px 9px",borderRadius:7,
                    border:l.includes("★")?`1px solid ${C.g200}`:`1px solid ${C.bdr}`}}>
                    <span style={{fontSize:10,color:C.t3}}>{l}: </span><b style={{fontSize:11,color:l.includes("★")?C.g800:C.t2}}>{v}%</b>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <div style={{background:C.warnL,borderRadius:10,padding:12,fontSize:11,color:C.warn}}>⚠️ 過去の実績は将来の運用成果を保証しません。長期・分散・積立が基本です。</div>
        </>}

        {/* ── LIFEPLAN ── */}
        {rtab==="lifeplan"&&<Card>
          <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>ライフプラン（確定値）</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:8}}>年金・教育費・イベント・贈与・インフレ考慮</div>
          <div style={{fontSize:11,color:C.t3,marginBottom:14,display:"flex",gap:16,flexWrap:"wrap"}}>
            <span><span style={{color:C.fire,fontWeight:700}}>★</span> = リタイア年（その年から取り崩し開始）</span>
            <span><span style={{color:C.ok,fontWeight:700}}>年金</span> = 年金受給開始後</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={lifecycle.filter((_,i)=>i%2===0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bdr}/>
              <XAxis dataKey="age" tickFormatter={v=>v+"歳"} tick={{fill:C.t3,fontSize:10}} interval={Math.floor(lifecycle.length/10)}/>
              <YAxis tickFormatter={v=>`${v}万`} tick={{fill:C.t3,fontSize:10}}/>
              <Tooltip content={<Tip/>}/>
              <ReferenceLine x={form.retireAge} stroke={C.warn} strokeDasharray="4 4" label={{value:"退職",fill:C.warn,fontSize:10}}/>
              <Area type="monotone" dataKey="asset" fill={C.g100} stroke={C.g600} strokeWidth={2} name="資産残高"/>
              <Line type="monotone" dataKey="invest" stroke={C.g400} strokeDasharray="3 3" dot={false} name="積立"/>
              <Line type="monotone" dataKey="withdraw" stroke={C.err} strokeDasharray="3 3" dot={false} name="取り崩し"/>
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{marginTop:14,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:C.g100}}>
                  {["年","年齢","資産残高","積立","取り崩し","年金","イベント"].map(h=>(
                    <th key={h} style={{padding:"7px 9px",textAlign:"right",fontWeight:700,color:C.t2,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lifecycle.filter((_,i)=>i%2===0).map((r,i)=>(
                  <tr key={r.year} style={{background:i%2===0?"#fff":C.muted}}>
                    <td style={{padding:"6px 9px",color:C.t3,textAlign:"right"}}>{r.year}</td>
                    <td style={{padding:"6px 9px",fontWeight:r.retired?700:400,color:r.retired?C.fire:C.t2,textAlign:"right"}}>{r.age}歳{r.retired?" ★":""}</td>
                    <td style={{padding:"6px 9px",fontWeight:700,color:C.g700,textAlign:"right"}}>{r.asset.toLocaleString()}万</td>
                    <td style={{padding:"6px 9px",color:C.g400,textAlign:"right"}}>{r.invest>0?r.invest.toLocaleString():"-"}</td>
                    <td style={{padding:"6px 9px",color:C.err,textAlign:"right"}}>{r.withdraw>0?r.withdraw.toLocaleString():"-"}</td>
                    <td style={{padding:"6px 9px",color:C.ok,textAlign:"right"}}>{r.pension>0?r.pension.toLocaleString():"-"}</td>
                    <td style={{padding:"6px 9px",color:C.warn,textAlign:"right"}}>{r.evCost>0?r.evCost.toLocaleString():"-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>}

        {/* ── FIRE DIAGNOSIS ── */}
        {rtab==="fire"&&<>
          {fireDiag.map(f=>(
            <Card key={f.key} style={{marginBottom:12,border:`1.5px solid ${f.achieved?f.color+"66":C.bdr}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:16,fontWeight:900,color:f.color,fontFamily:SERIF}}>{f.label}</span>
                    {f.achieved&&<span style={{background:f.color+"22",color:f.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,border:`1px solid ${f.color}44`}}>✓ 達成</span>}
                  </div>
                  <div style={{fontSize:11,color:C.t3}}>{f.desc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:10,color:C.t3}}>目標</div>
                  <div style={{fontSize:18,fontWeight:800,color:f.color,fontFamily:SERIF}}>{fmtM(f.target)}</div>
                </div>
              </div>
              <Prog val={f.progress} color={f.color} h={9}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontSize:11,color:C.t3}}>現在 {fmtM(form.currentAsset)}</span>
                {!f.achieved&&<span style={{fontSize:11,color:f.color,fontWeight:700}}>あと {fmtM(f.gap)}</span>}
                <span style={{fontSize:11,color:C.t3}}>{Math.round(f.progress)}%</span>
              </div>
            </Card>
          ))}
        </>}

        {/* ── POSITION ── */}
        {rtab==="position"&&<>
          <Card style={{marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:12,color:C.t3,marginBottom:8}}>同年代の資産分布における立ち位置</div>
            <div style={{fontFamily:SERIF,fontSize:36,fontWeight:700,color:C.g700}}>{pct}</div>
            <div style={{fontSize:12,color:C.t2,marginTop:6}}>金融資産 <b style={{color:C.g800}}>{fmtM(form.currentAsset)}</b> ／ {form.currentAge}歳</div>
          </Card>
          <Card>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:16}}>🏦 資産層ピラミッド（野村総研 2023年）</div>
            {TIERS.map((t,i)=>{const isMe=tier.label===t.label;const ws=[25,40,55,70,100];return(
              <div key={t.label} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:isMe?700:400,color:isMe?t.color:C.t2}}>{isMe?"▶ ":""}{t.label}</span>
                  <span style={{fontSize:10,color:C.t3}}>{t.count} ｜ {t.desc}</span>
                </div>
                <div style={{height:26,background:C.g100,borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${ws[i]}%`,background:isMe?t.color:t.color+"44",borderRadius:6,
                    display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}>
                    {isMe&&<span style={{fontSize:10,color:"#fff",fontWeight:700}}>← あなた</span>}
                  </div>
                </div>
              </div>
            );})}
          </Card>
        </>}

        {/* ── PENSION ── */}
        {rtab==="pension"&&<>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:14}}>🎌 年金試算の詳細</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
              {[{l:"本人 基礎年金",v:Math.round(rPens.base/MAN)},
                rPens.fuka>0?{l:"付加年金",v:Math.round(rPens.fuka/MAN)}:null,
                {l:"本人 厚生年金",v:Math.round(rPens.kosei/MAN)},
                form.hasPartner?{l:"パートナー年金",v:Math.round(rPP.total/MAN)}:null,
                {l:"世帯合計（月額）",v:Math.round(rTotPens/12/MAN*10)/10,unit:"万円/月",big:true},
              ].filter(Boolean).map(item=>(
                <div key={item.l} style={{background:C.g100,borderRadius:11,padding:"13px 14px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:3}}>{item.l}</div>
                  <div style={{fontSize:item.big?22:17,fontWeight:800,color:C.g800,fontFamily:SERIF}}>{item.v}</div>
                  <div style={{fontSize:10,color:C.t3}}>{item.unit||"万円/年"}</div>
                </div>
              ))}
            </div>
            {form.ideco_active&&<div style={{background:C.goldL,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.gold}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:2}}>iDeCo 退職時試算資産</div>
              <div style={{fontSize:20,fontWeight:800,color:C.gold,fontFamily:SERIF}}>{fmtM(pens.ideco_asset)}</div>
              <div style={{fontSize:10,color:C.t3}}>月{form.ideco_monthly}万 × {form.retireAge-form.currentAge}年 / 年率{form.ideco_rate}%</div>
            </div>}
          </Card>
          <Card>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:14}}>💴 運用益の税金試算</div>
            {(()=>{
              const yrs=Math.max(0,form.retireAge-form.currentAge);
              const gross=toY(form.investAsset||form.currentAsset)*(1+blend.rate/100)**yrs;
              const cost=toY(form.investAsset||form.currentAsset)+toY(form.monthlyInvest)*12*yrs;
              const gain=Math.max(0,gross-cost); const tax=gain*0.20315; const net=gain-tax;
              return[{l:`${form.retireAge}歳時 税引前資産`,v:fmt(gross),c:C.g700},
                {l:"含み益",v:fmt(gain),c:C.g600},{l:"譲渡益税（20.315%）",v:fmt(tax),c:C.err},
                {l:"税引後の手取り利益",v:fmt(net),c:C.g800}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"10px 13px",borderRadius:9,marginBottom:7,background:C.muted}}>
                  <span style={{fontSize:12,color:C.t2}}>{r.l}</span>
                  <span style={{fontSize:14,fontWeight:700,color:r.c}}>{r.v}</span>
                </div>
              ));
            })()}
            <div style={{background:C.g100,borderRadius:9,padding:11,marginTop:6,fontSize:11,color:C.g800}}>
              💡 新NISA（年360万円・生涯1,800万円）をフル活用すると税引後資産が大きく向上します。
            </div>
          </Card>
        </>}

        {/* ── INHERITANCE ── */}
        {rtab==="inherit"&&<>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>🏛 相続税シミュレーション</div>
            <div style={{fontSize:11,color:C.t3,marginBottom:14}}>法定相続人2人（子2人）想定 ／ 基礎控除: 3,000万 + 600万×2 = 4,200万円</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[{l:`${form.lifeExpectancy}歳時 金融資産（推定）`,v:fmtM(estateAtDeath),c:C.g700},
                {l:"不動産純資産",v:form.hasHome?fmtM(netHome):"なし",c:C.g600},
                form.inheritReceiveActive&&inheritReceived>0?{l:"親の遺産受取（込み）",v:"+"+fmtM(inheritReceived),c:C.gold}:null,
                {l:"遺産総額（概算）",v:fmtM(estateAtDeath+netHome+inheritReceived),c:C.t1,big:true},
                {l:"基礎控除",v:"4,200万円",c:C.t3},
                {l:"課税対象額",v:fmtM(Math.max(0,estateAtDeath+netHome+inheritReceived-4200)),c:C.warn},
                {l:"推定相続税",v:fmtM(inheritT),c:C.err,big:true},
              ].filter(Boolean).map(item=>(
                <div key={item.l} style={{background:C.muted,borderRadius:11,padding:"12px 13px"}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:3}}>{item.l}</div>
                  <div style={{fontSize:item.big?19:15,fontWeight:item.big?800:700,color:item.c,fontFamily:item.big?SERIF:FONT}}>{item.v}</div>
                </div>
              ))}
            </div>
          </Card>
          {form.giftActive&&<Card style={{background:C.g100,border:`1px solid ${C.g200}`,marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:C.g800,marginBottom:10}}>🎁 生前贈与による節税効果</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:C.card,borderRadius:9,padding:"10px 13px"}}>
                <div style={{fontSize:10,color:C.t3}}>総贈与額（{form.giftYears}年間）</div>
                <div style={{fontSize:18,fontWeight:800,color:C.g700,fontFamily:SERIF}}>{fmtM(form.giftAmount*form.giftPeople*form.giftYears)}</div>
              </div>
              <div style={{background:C.card,borderRadius:9,padding:"10px 13px"}}>
                <div style={{fontSize:10,color:C.t3}}>推定節税額</div>
                <div style={{fontSize:18,fontWeight:800,color:C.g600,fontFamily:SERIF}}>{fmtM(Math.max(0,inheritTax(estateAtDeath+netHome)-inheritTax(Math.max(0,estateAtDeath+netHome-form.giftAmount*form.giftPeople*form.giftYears))))}</div>
              </div>
            </div>
            <div style={{fontSize:10,color:C.t3,marginTop:8}}>※ 相続開始前7年以内の贈与は持ち戻し。専門家にご相談ください。</div>
          </Card>}
          {form.inheritReceiveActive&&<Card style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:C.gold,marginBottom:12}}>🏛 親からの相続シミュレーション</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:12}}>
              {[{l:"親の総遺産",v:fmtM(form.inheritReceiveAmount),c:C.t1},
                {l:"相続人数（合計）",v:(form.inheritSiblings+1)+"人",c:C.t3},
                {l:"あなたの法定取り分",v:fmtM(inheritShare),c:C.gold,big:true},
                form.inheritHasDebt?{l:"うち債務按分",v:"−"+fmtM(inheritDebtShare),c:C.err}:null,
                form.inheritHasDebt?{l:"差引 手取り",v:fmtM(inheritNetShare),c:inheritNetShare>0?C.ok:C.err,big:true}:null,
                {l:"相続税（概算）",v:inheritReceiveTax>0?fmtM(inheritReceiveTax):"非課税",c:inheritReceiveTax>0?C.err:C.ok},
              ].filter(Boolean).map(item=>(
                <div key={item.l} style={{background:item.big?C.goldL:C.muted,borderRadius:10,padding:"11px 13px",border:item.big?`1px solid ${C.gold}33`:`1px solid ${C.bdr}`}}>
                  <div style={{fontSize:10,color:C.t3,marginBottom:3}}>{item.l}</div>
                  <div style={{fontSize:item.big?18:14,fontWeight:item.big?800:600,color:item.c,fontFamily:item.big?SERIF:FONT}}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.t2,background:C.muted,borderRadius:8,padding:"9px 12px",marginBottom:form.inheritHasDebt?10:0}}>
              {form.inheritReceiveYear}年（あなた {form.currentAge+(form.inheritReceiveYear-new Date().getFullYear())}歳）に受取予定。シミュレーションに反映済みです。
            </div>
            {form.inheritHasDebt&&inheritNetShare<=0&&<div style={{background:C.errL,borderRadius:10,padding:"12px 14px",border:`1.5px solid ${C.err}66`,marginTop:10}}>
              <div style={{fontSize:13,fontWeight:800,color:C.err,marginBottom:6}}>🚨 相続放棄を強く検討してください</div>
              <div style={{fontSize:11,color:C.err,lineHeight:1.9}}>
                債務が遺産を上回っています。<b>相続開始を知った日から3ヶ月以内</b>に家庭裁判所へ相続放棄の申述を。弁護士・司法書士へ早急にご相談ください。
              </div>
            </div>}
          </Card>}
          <div style={{background:C.warnL,borderRadius:10,padding:12,fontSize:11,color:C.warn}}>⚠️ この試算は概算です。正確な計算・対策は税理士・FPへご相談ください。</div>
        </>}

        {/* ── SHARE ── */}
        {rtab==="share"&&<>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:4}}>📱 SNSシェア</div>
            <div style={{fontSize:11,color:C.t3,marginBottom:14}}>X（Twitter）・Instagramなどでシェアできる画像カードです。</div>
            <ShareCard form={form} results={{...results,fireDiag}} blended={blend}/>
          </Card>
          <Card>
            <div style={{fontSize:15,fontWeight:800,color:C.t1,marginBottom:8}}>📄 PDF・印刷保存</div>
            <div style={{background:C.infoL,borderRadius:10,padding:"12px 14px",marginBottom:12,border:`1px solid ${C.info}33`,fontSize:11,color:C.t2,lineHeight:2}}>
              <b>【PC / Mac】</b>　Ctrl+P（Mac: ⌘+P）→ 送信先で「PDFに保存」<br/>
              <b>【スマートフォン】</b>　ブラウザメニュー →「共有」または「印刷」→「PDFとして保存」<br/>
              <b>【ボタンが反応しない場合】</b>　ブラウザのポップアップブロックを解除するか、キーボードショートカットをお使いください。
            </div>
            <button
              onClick={()=>{
                const el=document.getElementById("report-root");
                if(el) el.style.overflow="visible";
                try{
                  const result = window.print();
                  // window.print() returns undefined on success in most browsers
                } catch(e){
                  alert("ブラウザの印刷機能（Ctrl+P / ⌘+P）をご利用ください。");
                }
              }}
              style={{width:"100%",padding:13,borderRadius:10,border:"none",
                background:`linear-gradient(135deg,${C.g700},${C.g500})`,color:"#fff",
                fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 8px rgba(21,128,61,0.15)`,
                letterSpacing:0.3}}>
              🖨️ 印刷 / PDF保存
            </button>
            <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:10,color:C.t4}}>ショートカット：</span>
              <span style={{fontSize:11,fontWeight:700,color:C.t2,background:C.muted,padding:"2px 8px",borderRadius:5,border:`1px solid ${C.bdr}`,fontFamily:"monospace"}}>Ctrl+P</span>
              <span style={{fontSize:10,color:C.t4}}>または</span>
              <span style={{fontSize:11,fontWeight:700,color:C.t2,background:C.muted,padding:"2px 8px",borderRadius:5,border:`1px solid ${C.bdr}`,fontFamily:"monospace"}}>⌘+P</span>
            </div>
          </Card>
        </>}

        {/* 免責事項フッター（全タブ共通） */}
        <div style={{marginTop:8,padding:"14px 16px",borderRadius:12,background:"#fff",border:`1px solid ${C.bdr}`,fontSize:10,color:C.t3,lineHeight:1.8}}>
          <div style={{fontWeight:700,color:C.t2,marginBottom:4}}>⚠️ 免責事項 / Disclaimer</div>
          本シミュレーションは情報提供を目的とした概算ツールであり、投資助言・税務相談・ファイナンシャルプランニングの提供ではありません。
          モンテカルロ法による計算結果は過去データに基づく確率的試算であり、将来の運用成果・年金受給額・税額を保証するものではありません。
          投資には元本割れのリスクがあります。資産運用・税務・年金・相続に関する意思決定は、ファイナンシャルプランナー（CFP/AFP）・税理士・社会保険労務士等の専門家にご相談ください。
          年金試算は2025年度の制度・保険料率に基づく簡易計算です。実際の年金見込み額は「ねんきんネット」または「ねんきん定期便」でご確認ください。
          本ツールはすべての計算を端末内で完結しており、入力データを外部に送信しません。
        </div>

      </div>
    </div>
  );
}
