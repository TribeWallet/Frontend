import os
import sys
import time
import socket
import shutil
import subprocess
import argparse
import random
from pathlib import Path
from datetime import datetime
from threading import Thread, Event
from typing import Optional

try:
    from colorama import init as colorama_init
    from colorama import Fore, Style
except ImportError:
    print("Colorama nao instalado. Execute: pip install colorama")
    sys.exit(1)

colorama_init(autoreset=True)

PROJECT_DIR = Path(__file__).resolve().parent
TMP_DIR = PROJECT_DIR / ".tmp"
LOG_DIR = TMP_DIR / "logs"

METRO_PORT_MIN = 8081
METRO_PORT_MAX = 8999

DEVICE_TIMEOUT = 180
BOOT_TIMEOUT = 300
METRO_READY_TIMEOUT = 60

HASHE_TMP = Path(os.environ.get("TEMP", os.environ.get("TMP", "C:/Windows/Temp")))

APP_ID = "com.tribewalletnative"

START_TIME = time.time()
STEP_COUNTER = 0
CURRENT_LOG_FILE: Optional[Path] = None
LAUNCHER_PIDS: list[int] = []
KEEP_RUNNING = True
shutdown_event = Event()


def create_directories() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)


def create_log_file() -> None:
    global CURRENT_LOG_FILE
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    CURRENT_LOG_FILE = LOG_DIR / f"launcher_{timestamp}.log"
    CURRENT_LOG_FILE.touch(exist_ok=True)


def write_log(message: str) -> None:
    if CURRENT_LOG_FILE is None:
        return
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(CURRENT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{ts}] {message}\n")
    except Exception:
        pass


def out(message: str = "", color: str | None = None) -> None:
    if color:
        print(color + message + Style.RESET_ALL, flush=True)
    else:
        print(message, flush=True)
    write_log(message)


def info(message: str) -> None:
    out(f"[INFO] {message}", Fore.CYAN)


def success(message: str) -> None:
    out(f"[ OK ] {message}", Fore.GREEN)


def warning(message: str) -> None:
    out(f"[WARN] {message}", Fore.YELLOW)


def error(message: str) -> None:
    out(f"[ERRO] {message}", Fore.RED)


def elapsed() -> str:
    seconds = int(time.time() - START_TIME)
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def print_header() -> None:
    print()
    out("=" * 72, Fore.BLUE)
    out("                    TRIBEWALLET NATIVE", Fore.CYAN)
    out("              PROFESSIONAL DEV LAUNCHER v2", Fore.CYAN)
    out("=" * 72, Fore.BLUE)
    print()
    out(f"Projeto : {PROJECT_DIR}", Fore.WHITE)
    out(f"Python  : {sys.version.split()[0]}", Fore.WHITE)
    out(f"Tempo   : {elapsed()}", Fore.WHITE)
    print()


def step(title: str) -> None:
    global STEP_COUNTER
    STEP_COUNTER += 1
    print()
    out("-" * 72, Fore.BLUE)
    out(f"[{STEP_COUNTER:02d}] {title}", Fore.CYAN)
    out("-" * 72, Fore.BLUE)


def run_command(
    command: list[str],
    cwd: Path | None = None,
    timeout: float | None = None,
    capture: bool = False,
    shell: bool = False,
) -> subprocess.CompletedProcess:
    write_log("COMMAND: " + " ".join(str(x) for x in command))
    try:
        return subprocess.run(
            command,
            cwd=str(cwd or PROJECT_DIR),
            timeout=timeout,
            capture_output=capture,
            text=True,
            shell=shell,
        )
    except FileNotFoundError:
        raise RuntimeError(f"Executavel nao encontrado: {command[0]}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("Comando excedeu o tempo limite.")


def find_command(name: str) -> str | None:
    path = shutil.which(name)
    if path:
        return path
    for ext in (".cmd", ".exe", ".bat"):
        path = shutil.which(name + ext)
        if path:
            return path
    return None


def check_tool(name: str) -> str:
    exe = find_command(name)
    if not exe:
        raise RuntimeError(f"{name} nao encontrado no PATH.")
    result = run_command([exe, "--version"], capture=True)
    if result.returncode != 0:
        raise RuntimeError(f"{name} retornou erro:\n{result.stderr}")
    success(f"{name} encontrado: {result.stdout.strip()}")
    info(f"Executavel: {exe}")
    return exe


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="TribeWallet Native Launcher")
    parser.add_argument(
        "--platform", choices=["android", "ios", "both"], default="android",
        help="Plataforma alvo (default: android)",
    )
    parser.add_argument("--clean", action="store_true", help="Forcar Gradle clean")
    parser.add_argument("--port", type=int, help="Porta Metro fixa (auto se omitido)")
    return parser.parse_args()


def validate_project() -> None:
    step("Validando projeto React Native")
    for name, path in [
        ("package.json", "package.json"),
        ("android/", "android"),
        ("node_modules/", "node_modules"),
    ]:
        p = PROJECT_DIR / path
        if p.exists():
            success(f"{name} encontrado.")
        else:
            if name == "node_modules/":
                warning("node_modules nao existe. Execute 'npm install'.")
            else:
                raise RuntimeError(f"{name} nao encontrado.")


def find_android_sdk() -> Path | None:
    for env in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        value = os.environ.get(env)
        if value:
            p = Path(value)
            if p.exists():
                return p
    local = os.environ.get("LOCALAPPDATA")
    if local:
        p = Path(local) / "Android" / "Sdk"
        if p.exists():
            return p
    return None


def find_android_tools() -> tuple[Path, Path, Path]:
    step("Localizando Android SDK")
    sdk = find_android_sdk()
    if not sdk:
        raise RuntimeError("Android SDK nao encontrado.")
    adb = sdk / "platform-tools" / "adb.exe"
    emulator = sdk / "emulator" / "emulator.exe"
    if not adb.exists():
        raise RuntimeError(f"adb.exe nao encontrado: {adb}")
    if not emulator.exists():
        raise RuntimeError(f"emulator.exe nao encontrado: {emulator}")
    success(f"Android SDK: {sdk}")
    info(f"ADB: {adb}")
    info(f"Emulator: {emulator}")
    return sdk, adb, emulator


def adb_cmd(adb: Path, *args: str) -> subprocess.CompletedProcess:
    return run_command([str(adb), *args], capture=True)


def start_adb(adb: Path) -> None:
    step("Iniciando Android Debug Bridge")
    result = adb_cmd(adb, "start-server")
    if result.returncode != 0:
        raise RuntimeError("Falha ao iniciar ADB:\n" + result.stderr)
    success("ADB iniciado.")


def get_devices(adb: Path) -> list[tuple[str, str]]:
    result = adb_cmd(adb, "devices")
    if result.returncode != 0:
        return []
    devices: list[tuple[str, str]] = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line or line.startswith("List of devices"):
            continue
        parts = line.split()
        if len(parts) >= 2:
            devices.append((parts[0], parts[1]))
    return devices


def get_ready_device(adb: Path) -> str | None:
    for serial, state in get_devices(adb):
        if state == "device":
            return serial
    return None


def get_avds(emulator: Path) -> list[str]:
    result = run_command([str(emulator), "-list-avds"], capture=True)
    if result.returncode != 0:
        raise RuntimeError("Nao foi possivel listar os AVDs:\n" + result.stderr)
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def start_emulator(emulator: Path, avd: str) -> subprocess.Popen:
    info(f"Iniciando AVD: {avd}")
    proc = subprocess.Popen(
        [str(emulator), "-avd", avd, "-netdelay", "none",
         "-netspeed", "full", "-no-snapshot"],
        cwd=str(PROJECT_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )
    LAUNCHER_PIDS.append(proc.pid)
    return proc


def wait_for_device(adb: Path) -> str:
    step("Aguardando dispositivo Android")
    start = time.time()
    while time.time() - start < DEVICE_TIMEOUT:
        dev = get_ready_device(adb)
        if dev:
            success(f"Dispositivo conectado: {dev}")
            return dev
        if int(time.time() - start) % 10 == 0:
            info(f"Aguardando... {int(time.time() - start)}s")
        time.sleep(2)
    raise TimeoutError("Android nao ficou disponivel dentro do tempo limite.")


def wait_for_boot(adb: Path, device: str) -> None:
    step("Aguardando boot completo do Android")
    start = time.time()
    while time.time() - start < BOOT_TIMEOUT:
        result = adb_cmd(adb, "-s", device, "shell", "getprop", "sys.boot_completed")
        if result.returncode == 0 and result.stdout.strip() == "1":
            success("Android inicializado completamente.")
            return
        time.sleep(2)
    raise TimeoutError("Timeout aguardando boot completo.")


def port_is_free(port: int) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.settimeout(0.25)
        return sock.connect_ex(("127.0.0.1", port)) != 0
    finally:
        sock.close()


def find_free_port() -> int:
    step("Selecionando porta Metro disponivel")
    candidates = list(range(METRO_PORT_MIN, METRO_PORT_MAX + 1))
    random.shuffle(candidates)
    for port in candidates:
        if port_is_free(port):
            success(f"Porta disponivel: {port}")
            return port
    raise RuntimeError(f"Nenhuma porta disponivel entre {METRO_PORT_MIN}-{METRO_PORT_MAX}.")


def kill_port_owner(port: int) -> None:
    try:
        output = subprocess.check_output(
            ["netstat", "-ano", "-p", "TCP"],
            text=True, stderr=subprocess.DEVNULL,
        )
    except Exception:
        return
    pids: set[int] = set()
    needle = f":{port} "
    for line in output.splitlines():
        if "LISTENING" not in line or needle not in line:
            continue
        parts = line.split()
        if len(parts) >= 5:
            try:
                pids.add(int(parts[-1]))
            except ValueError:
                pass
    for pid in pids:
        try:
            subprocess.run(["taskkill", "/F", "/PID", str(pid)],
                           capture_output=True, check=False)
            info(f"Porta {port}: processo {pid} encerrado.")
        except Exception:
            pass


def purge_metro_cache() -> None:
    step("Limpando caches do Metro")
    targets: list[Path] = []
    temp_cache = HASHE_TMP / "metro-cache"
    if temp_cache.exists():
        targets.append(temp_cache)
    for entry in HASHE_TMP.glob("metro-file-map-*"):
        if entry.is_file():
            targets.append(entry)
    project_cache = PROJECT_DIR / "node_modules" / ".cache" / "metro"
    if project_cache.exists():
        targets.append(project_cache)
    if not targets:
        info("Nenhum cache do Metro encontrado.")
        return
    for path in targets:
        try:
            if path.is_dir():
                shutil.rmtree(path, ignore_errors=True)
            else:
                path.unlink(missing_ok=True)
            success(f"Removido: {path}")
        except Exception as exc:
            warning(f"Falha ao remover {path}: {exc}")


def validate_metro_cache() -> None:
    step("Validando integridade dos caches do Metro")
    corrupted: list[Path] = []
    for entry in HASHE_TMP.glob("metro-file-map-*"):
        if not entry.is_file():
            continue
        try:
            if entry.stat().st_size == 0:
                corrupted.append(entry)
                continue
            with open(entry, "rb") as f:
                if not f.read(8):
                    corrupted.append(entry)
        except OSError:
            corrupted.append(entry)
    if corrupted:
        warning(f"{len(corrupted)} cache(s) do Metro potencialmente corrompido(s).")
        for p in corrupted:
            info(f"  - {p}")
        purge_metro_cache()
    else:
        success("Caches do Metro intactos.")


def start_in_new_console(title: str, command: str) -> subprocess.Popen:
    safe_title = title.replace("&", "^")
    full = f"title {safe_title} && {command}"
    write_log(f"OPEN TERMINAL: {full}")
    return subprocess.Popen(
        ["cmd.exe", "/D", "/K", full],
        cwd=str(PROJECT_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )


def start_metro(port: int) -> subprocess.Popen:
    # If Metro already running on the desired port, reuse it
    if not port_is_free(port):
        info(f"Metro já está rodando na porta {port}, reutilizando.")
        return None
    step(f"Iniciando Metro na porta {port}")
    cmd = f"npx.cmd --no-install react-native start --port {port}"
    proc = start_in_new_console(f"TribeWallet - Metro {port}", cmd)
    LAUNCHER_PIDS.append(proc.pid)
    success("Terminal do Metro aberto.")
    return proc


def wait_for_metro(port: int, timeout: float = METRO_READY_TIMEOUT) -> bool:
    info(f"Aguardando Metro responder em http://localhost:{port}/status")
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1.5) as sock:
                sock.sendall(b"GET /status HTTP/1.1\r\nHost: localhost\r\n\r\n")
                data = sock.recv(4096).decode("utf-8", errors="ignore")
                if "packager-status:running" in data:
                    success("Metro pronto.")
                    return True
        except OSError:
            pass
        time.sleep(1)
    warning("Metro nao respondeu dentro do tempo limite.")
    return False


def clean_gradle(force: bool = False) -> None:
    step("Preparando build Android")
    android_dir = PROJECT_DIR / "android"
    gradlew = android_dir / "gradlew.bat"
    if not gradlew.exists():
        raise RuntimeError("gradlew.bat nao encontrado.")
    build_dir = android_dir / "app" / "build"
    if force:
        info("Executando Gradle clean...")
    elif build_dir.exists():
        info("Build dir existe – pulando clean (use --clean para forcar).")
        return
    else:
        info("Primeira build – executando clean...")
    result = subprocess.run([str(gradlew), "clean"], cwd=str(android_dir))
    if result.returncode != 0:
        raise RuntimeError("Gradle clean falhou.")
    success("Gradle clean concluido.")


def build_android(port: int) -> bool:
    step("Compilando e instalando aplicativo Android")
    info(f"Metro porta {port} | Build incremental")
    cmd = [
        "npx.cmd", "--no-install", "react-native", "run-android",
        "--port", str(port), "--active-arch-only",
    ]
    write_log("ANDROID BUILD: " + " ".join(cmd))
    result = subprocess.run(cmd, cwd=str(PROJECT_DIR))
    if result.returncode != 0:
        error("Build Android falhou.")
        return False
    success("Aplicativo compilado e instalado.")
    return True


def build_ios() -> bool:
    step("Compilando e executando aplicativo iOS")
    cmd = ["npx.cmd", "--no-install", "react-native", "run-ios"]
    write_log("IOS BUILD: " + " ".join(cmd))
    result = subprocess.run(cmd, cwd=str(PROJECT_DIR))
    if result.returncode != 0:
        error("Build iOS falhou.")
        return False
    success("App iOS executado com sucesso.")
    return True


def verify_app(adb: Path, device: str) -> bool:
    step("Verificando aplicativo no dispositivo")
    result = adb_cmd(adb, "-s", device, "shell", "pm", "list", "packages")
    if result.returncode != 0:
        warning("Nao foi possivel verificar o package.")
        return False
    if f"package:{APP_ID}" in result.stdout:
        success(f"Package encontrado: {APP_ID}")
        return True
    warning(f"Package {APP_ID} nao encontrado na lista.")
    return False


def start_logcat(adb: Path, device: str) -> subprocess.Popen:
    step("Abrindo monitor Logcat")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = LOG_DIR / f"logcat_{ts}.txt"
    write_log(f"Logcat: {log_file}")
    cmd = f'"{adb}" -s {device} logcat > "{log_file}"'
    proc = start_in_new_console("TribeWallet - Android Logcat", cmd)
    LAUNCHER_PIDS.append(proc.pid)
    success("Logcat aberto.")
    return proc


def shutdown_all(adb: Path | None = None, device: str | None = None) -> None:
    global KEEP_RUNNING
    KEEP_RUNNING = False
    shutdown_event.set()
    out()
    out("=" * 72, Fore.YELLOW)
    out("                  ENCERRANDO TUDO", Fore.YELLOW)
    out("=" * 72, Fore.YELLOW)

    # Kill PIDs we opened
    for pid in LAUNCHER_PIDS:
        try:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)],
                           capture_output=True, check=False)
        except Exception:
            pass

    # Kill child cmd.exe processes of our consoles
    try:
        output = subprocess.check_output(
            ["wmic", "process", "where", "name='cmd.exe'",
             "get", "processid,parentprocessid"],
            text=True, stderr=subprocess.DEVNULL,
        )
        launcher_set = set(LAUNCHER_PIDS)
        for line in output.splitlines()[1:]:
            line = line.strip()
            if not line:
                continue
            try:
                pid_str, ppid_str = line.split()
                ppid = int(ppid_str)
                if ppid in launcher_set:
                    subprocess.run(["taskkill", "/F", "/T", "/PID", pid_str],
                                   capture_output=True, check=False)
            except (ValueError, OSError):
                pass
    except Exception:
        pass

    if adb is not None:
        try:
            subprocess.run([str(adb), "emu", "kill"],
                           capture_output=True, check=False)
        except Exception:
            pass

    success("Tudo encerrado.")


def print_summary(device: str, port: int, platform: str) -> None:
    print()
    out("=" * 72, Fore.GREEN)
    out("                  TRIBEWALLET INICIADO", Fore.GREEN)
    out("=" * 72, Fore.GREEN)
    print()
    out(f"Projeto    : {PROJECT_DIR}")
    out(f"Plataforma : {platform}")
    out(f"Dispositivo: {device}")
    out(f"Metro      : porta {port}")
    out(f"Tempo      : {elapsed()}")
    out(f"Log        : {CURRENT_LOG_FILE}")
    print()
    out("Terminais ativos:", Fore.CYAN)
    if platform in ("android", "both"):
        out("  [1] Android Emulator")
        out("  [2] Android Logcat")
    if platform in ("ios", "both"):
        out("  [3] iOS Simulator")
    out("  [M] Metro Bundler")
    print()
    out("Comandos:", Fore.CYAN)
    out("  [0]       Encerrar tudo", Fore.YELLOW)
    out("  [c]       Limpar cache Metro", Fore.YELLOW)
    out("  [clean]   Gradle clean completo", Fore.YELLOW)
    out("  [ENTER]   Finalizar launcher", Fore.YELLOW)
    print()
    out("=" * 72, Fore.GREEN)
    print()


def monitor_loop(adb: Path | None) -> None:
    global KEEP_RUNNING
    while not shutdown_event.is_set():
        try:
            command = sys.stdin.readline()
        except Exception:
            break
        if not command:
            break
        stripped = command.strip().lower()
        if stripped in ("0", "q", "quit", "exit", "sair"):
            KEEP_RUNNING = False
            shutdown_event.set()
            shutdown_all(adb)
            break
        elif stripped in ("c", "cache"):
            purge_metro_cache()
            print("Cache do Metro limpo. Reinicie Metro para aplicar.", flush=True)
        elif stripped == "clean":
            print("Executando Gradle clean...", flush=True)
            try:
                clean_gradle(force=True)
                print("Pronto. Execute 'npx react-native run-android' para rebuildar.", flush=True)
            except Exception as exc:
                print(f"Erro no clean: {exc}", flush=True)


def main() -> None:
    global KEEP_RUNNING, MONITOR_THREAD

    args = parse_args()

    create_directories()
    create_log_file()
    print_header()
    info(f"Log salvo em: {CURRENT_LOG_FILE}")

    validate_project()
    check_tool("node")
    check_tool("npm")
    check_tool("npx")

    adb_path: Path | None = None
    emulator_path: Path | None = None
    device: str | None = None

    if args.platform in ("android", "both"):
        sdk, adb_path, emulator_path = find_android_tools()
        start_adb(adb_path)
        validate_metro_cache()

        step("Verificando dispositivos Android")
        device = get_ready_device(adb_path)
        if not device:
            warning("Nenhum dispositivo Android ativo.")
            avds = get_avds(emulator_path)
            if not avds:
                raise RuntimeError("Nenhum AVD encontrado. Crie no Android Studio.")
            out("AVDs encontrados:", Fore.CYAN)
            for i, avd in enumerate(avds, 1):
                out(f"  [{i}] {avd}")
            selected = avds[0]
            info(f"Selecionado automaticamente: {selected}")
            start_emulator(emulator_path, selected)
            device = wait_for_device(adb_path)
        wait_for_boot(adb_path, device)

    port = args.port if args.port else find_free_port()
    if not port_is_free(port):
        kill_port_owner(port)
        time.sleep(1)
        if not port_is_free(port):
            warning(f"Porta {port} ainda ocupada.")
            port = find_free_port()

    clean_gradle(force=args.clean)

    metro_proc = start_metro(port)
    if not wait_for_metro(port):
        warning("Metro nao respondeu a tempo.")

    if args.platform in ("android", "both"):
        if not build_android(port):
            error("Build Android falhou.")
            print_summary(device or "N/A", port, args.platform)
            shutdown_all(adb_path, device)
            return
        if device and not verify_app(adb_path, device):
            warning("Verificacao do app falhou, mas seguindo.")
        if device:
            start_logcat(adb_path, device)

    if args.platform in ("ios", "both"):
        if not build_ios():
            error("Build iOS falhou.")

    print_summary(device or "N/A", port, args.platform)

    MONITOR_THREAD = Thread(
        target=monitor_loop,
        args=(adb_path if args.platform != "ios" else None,),
        daemon=True,
    )
    MONITOR_THREAD.start()

    try:
        while KEEP_RUNNING:
            time.sleep(0.5)
    except KeyboardInterrupt:
        KEEP_RUNNING = False
    finally:
        shutdown_all(adb_path if args.platform != "ios" else None, device)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        warning("Launcher interrompido pelo usuario.")
        shutdown_all()
    except Exception as exc:
        print()
        error(str(exc))
        write_log("FATAL ERROR: " + repr(exc))
        print()
        out(f"Log completo: {CURRENT_LOG_FILE}", Fore.YELLOW)
        print()
        input("ENTER para fechar...")
