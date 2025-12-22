const DATA_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/semanas.json";
const USERS_URL = "https://raw.githubusercontent.com/alibhtty/buildup/main/timesburg/users.json";

async function cargarSemanas() {
  try {
    const req = new Request(DATA_URL);
    return JSON.parse(await req.loadString());
  } catch {
    return [];
  }
}

async function cargarUsuarios() {
  try {
    const req = new Request(USERS_URL);
    return await req.loadJSON();
  } catch {
    return {};
  }
}