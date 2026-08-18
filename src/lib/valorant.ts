export function getRankIconUrl(tier: number): string {
  if (tier <= 0) return "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/largeicon.png";
  return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tier}/largeicon.png`;
}

export function getAgentIconUrl(agentName: string): string {
  const map: Record<string, string> = {
    jett: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
    reyna: "https://media.valorant-api.com/agents/a3bfb854-43ae-cb28-8469-8dd9ee0aca33/displayicon.png",
    raze: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
    phoenix: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
    clove: "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
    omen: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
    iso: "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png",
    yoru: "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png",
    neon: "https://media.valorant-api.com/agents/bb2a483e-42d4-9e0f-1017-3dd02717bc28/displayicon.png",
    fade: "https://media.valorant-api.com/agents/dad69b49-4151-ad26-9630-379da1e055a3/displayicon.png",
    sova: "https://media.valorant-api.com/agents/320799f2-4704-c12e-492c-4f80eb49ac86/displayicon.png",
    viper: "https://media.valorant-api.com/agents/707eab51-47e6-8043-42e7-038290e2f5b8/displayicon.png",
    cypher: "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-30f0-15164235c877/displayicon.png",
    killjoy: "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png",
    chamber: "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
    brimstone: "https://media.valorant-api.com/agents/9f0d8ba9-42c0-b18e-7723-5e9c19d6eb35/displayicon.png",
    skye: "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
    breach: "https://media.valorant-api.com/agents/5f8d3d7f-467b-97f3-062c-dd40909670f0/displayicon.png",
    astra: "https://media.valorant-api.com/agents/41fb69c1-4153-7b72-3971-c6e0963e405e/displayicon.png",
    kayo: "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png",
    harbor: "https://media.valorant-api.com/agents/2ee09d02-4758-9737-1e0d-03e53740e118/displayicon.png",
    gekko: "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
    deadlock: "https://media.valorant-api.com/agents/cc8b64d8-4b25-4409-aece-9538eb659c4f/displayicon.png",
    vyse: "https://media.valorant-api.com/agents/b6890351-409d-0fb4-e58f-d6bb7ecab2cf/displayicon.png",
  };
  return map[agentName.toLowerCase()] || "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png";
}

const MAP_SPLASHES: Record<string, string> = {
  haven: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
  ascent: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
  lotus: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
  breeze: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
  split: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
  bind: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
  sunset: "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
  abyss: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
  icebox: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
  fracture: "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
  pearl: "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
  district: "https://media.valorant-api.com/maps/690b3ed2-4dff-945b-8223-6da834e30d24/splash.png",
  kasbah: "https://media.valorant-api.com/maps/12452a9d-48c3-0b02-e7eb-0381c3520404/splash.png",
  drift: "https://media.valorant-api.com/maps/2c09d728-42d5-30d8-43dc-96a05cc7ee9d/splash.png",
  glitch: "https://media.valorant-api.com/maps/d6336a5a-428f-c591-98db-c8a291159134/splash.png",
  piazza: "https://media.valorant-api.com/maps/de28aa9b-4cbe-1003-320e-6cb3ec309557/splash.png",
  corrode: "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png",
};

export function getMapSplashUrl(mapName: string): string {
  return MAP_SPLASHES[mapName.toLowerCase()] || "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png";
}
