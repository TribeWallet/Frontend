import os
import sys
import time
import socket
import shutil
import signal
import subprocess
from pathlib import Path
from datetime import datetime
from threading import Thread


try:
    from colorama import init as colorama_init
    from colorama import Fore, Style
except ImportError:
    print("Colorama não está instalado.")
    print()
    print("Execute:")
    print("pip install colorama")
    print()
    input("ENTER para sair...")
    sys.exit(1)

colorama_init(autoreset=True)


PROJECT_DIR = Path(__file__).resolve().parent
TMP_DIR = PROJECT_DIR / ".tmp"
LOG_DIR = TMP_DIR / "logs"

METRO_PORT_MIN = 8081
METRO_PORT_MAX = 8999

DEVICE_TIMEOUT = 180
BOOT_TIMEOUT = 180
METRO_START_WAIT = 6
BUNDLE_READY_TIMEOUT = 90
LOG_POLL_INTERVAL = 1.0

METRO_CACHE_NAMES = ("metro-cache", "metro-file-map")
HASHE_TMP = Path(os.environ.get("TEMP", os.environ.get("TMP", "C:/Windows/Temp")))

APP_ID = "com.tribewalletnative"
APP_MAIN_ACTIVITY = ".MainActivity"

START_TIME = time.time()
STEP_COUNTER = 0
CURRENT_LOG_FILE = None
LAUNCHER_PIDS: list[int] = []
KEEP_RUNNING = True
MONITOR_THREAD: Thread | None = None



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
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(CURRENT_LOG_FILE, "a", encoding="utf-8") as file:
            file.write(f"[{timestamp}] {message}\n")
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
    minutes = seconds // 60
    seconds = seconds % 60
    return f"{minutes:02d}:{seconds:02d}"



def print_header() -> None:
    print()
    out("=" * 72, Fore.BLUE)
    out("                    TRIBEWALLET NATIVE", Fore.CYAN)
    out("                 PROFESSIONAL DEV LAUNCHER", Fore.CYAN)
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



def find_command(name: str) -> str | None:
    path = shutil.which(name)
    if path:
        return path
    for ext in (".cmd", ".exe", ".bat"):
        path = shutil.which(name + ext)
        if path:
            return path
    return None


def run_command(
    command: list[str],
    cwd: Path | None = None,
    timeout: float | None = None,
    capture: bool = False,
) -> subprocess.CompletedProcess:
    write_log("COMMAND: " + " ".join(str(x) for x in command))
    try:
        return subprocess.run(
            command,
            cwd=str(cwd or PROJECT_DIR),
            timeout=timeout,
            capture_output=capture,
            text=True,
            shell=False,
        )
    except FileNotFoundError:
        raise RuntimeError("Executável não encontrado: " + str(command[0]))
    except subprocess.TimeoutExpired:
        raise RuntimeError("Comando excedeu o tempo limite.")



def check_tool(name: str) -> str:
    exe = find_command(name)
    if not exe:
        raise RuntimeError(f"{name} não encontrado no PATH.")
    result = run_command([exe, "--version"], capture=True)
    if result.returncode != 0:
        raise RuntimeError(f"{name} retornou erro:\n{result.stderr}")
    success(f"{name} encontrado: {result.stdout.strip()}")
    info(f"Executável: {exe}")
    return exe



def validate_project() -> None:
    step("Validando projeto React Native")
    package_json = PROJECT_DIR / "package.json"
    android_dir = PROJECT_DIR / "android"
    node_modules = PROJECT_DIR / "node_modules"

    if not package_json.exists():
        raise RuntimeError("package.json não encontrado.")
    success("package.json encontrado.")

    if not android_dir.exists():
        raise RuntimeError("Pasta android não encontrada.")
    success("Pasta android encontrada.")

    if not node_modules.exists():
        warning("node_modules não existe.")
        info("Execute 'npm install' antes de iniciar.")
    else:
        success("node_modules encontrado.")



def find_android_sdk() -> Path | None:
    candidates: list[Path] = []
    for env in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        value = os.environ.get(env)
        if value:
            candidates.append(Path(value))
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        candidates.append(Path(local_app_data) / "Android" / "Sdk")
    for path in candidates:
        if path.exists():
            return path
    return None


def find_android_tools() -> tuple[Path, Path, Path]:
    step("Localizando Android SDK")
    sdk = find_android_sdk()
    if not sdk:
        raise RuntimeError("Android SDK não encontrado.")
    adb_path = sdk / "platform-tools" / "adb.exe"
    emulator_path = sdk / "emulator" / "emulator.exe"
    if not adb_path.exists():
        raise RuntimeError(f"adb.exe não encontrado:\n{adb_path}")
    if not emulator_path.exists():
        raise RuntimeError(f"emulator.exe não encontrado:\n{emulator_path}")
    success(f"Android SDK: {sdk}")
    info(f"ADB: {adb_path}")
    info(f"Emulator: {emulator_path}")
    return sdk, adb_path, emulator_path



def adb_command(adb_path: Path, *args: str, capture: bool = True) -> subprocess.CompletedProcess:
    return run_command([str(adb_path), *args], capture=capture)


def start_adb(adb_path: Path) -> None:
    step("Iniciando Android Debug Bridge")
    result = adb_command(adb_path, "start-server")
    if result.returncode != 0:
        raise RuntimeError("Falha ao iniciar ADB:\n" + result.stderr)
    success("ADB iniciado.")



def get_devices(adb_path: Path) -> list[tuple[str, str]]:
    result = adb_command(adb_path, "devices")
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


def get_ready_device(adb_path: Path) -> str | None:
    for serial, state in get_devices(adb_path):
        if state == "device":
            return serial
    return None


def get_avds(emulator_path: Path) -> list[str]:
    result = run_command([str(emulator_path), "-list-avds"], capture=True)
    if result.returncode != 0:
        raise RuntimeError("Não foi possível listar os AVDs:\n" + result.stderr)
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def start_emulator(emulator_path: Path, avd: str) -> subprocess.Popen:
    info(f"Iniciando AVD: {avd}")
    process = subprocess.Popen(
        [
            str(emulator_path),
            "-avd",
            avd,
            "-netdelay",
            "none",
            "-netspeed",
            "full",
            "-no-snapshot",
        ],
        cwd=str(PROJECT_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )
    LAUNCHER_PIDS.append(process.pid)
    return process



def wait_for_device(adb_path: Path) -> str:
    step("Aguardando dispositivo Android")
    started = time.time()
    counter = 0
    while time.time() - started < DEVICE_TIMEOUT:
        device = get_ready_device(adb_path)
        if device:
            success(f"Dispositivo conectado: {device}")
            return device
        counter += 1
        if counter % 5 == 0:
            info(f"Aguardando... {int(time.time() - started)}s")
        time.sleep(2)
    raise TimeoutError("O Android não ficou disponível dentro do tempo limite.")


def wait_for_boot(adb_path: Path, device: str) -> None:
    step("Aguardando boot completo do Android")
    started = time.time()
    while time.time() - started < BOOT_TIMEOUT:
        result = adb_command(
            adb_path,
            "-s",
            device,
            "shell",
            "getprop",
            "sys.boot_completed",
        )
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


def find_random_metro_port() -> int:
    import random

    step("Selecionando porta Metro disponível")
    candidates = list(range(METRO_PORT_MIN, METRO_PORT_MAX + 1))
    random.shuffle(candidates)
    for port in candidates:
        if port_is_free(port):
            success(f"Porta disponível: {port}")
            return port
    raise RuntimeError(
        f"Nenhuma porta disponível entre {METRO_PORT_MIN} e {METRO_PORT_MAX}."
    )



def kill_process_by_port(port: int) -> bool:
    """Encerra qualquer processo escutando na porta (Windows)."""
    try:
        output = subprocess.check_output(
            ["netstat", "-ano", "-p", "TCP"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return False
    pids: set[int] = set()
    needle = f":{port} "
    for line in output.splitlines():
        if "LISTENING" not in line:
            continue
        if needle not in line:
            continue
        parts = line.split()
        if len(parts) >= 5:
            try:
                pids.add(int(parts[-1]))
            except ValueError:
                pass
    if not pids:
        return False
    for pid in pids:
        try:
            subprocess.run(
                ["taskkill", "/F", "/PID", str(pid)],
                capture_output=True,
                check=False,
            )
            info(f"Porta {port}: processo {pid} encerrado.")
        except Exception:
            pass
    return True


def purge_metro_cache() -> None:
    """Remove caches corrompidos do Metro (DiskCacheManager / v8.serialize)."""
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
    """Detecta caches do Metro corrompidos antes de iniciar."""
    step("Validando integridade dos caches do Metro")
    corrupted: list[Path] = []
    for entry in HASHE_TMP.glob("metro-file-map-*"):
        if not entry.is_file():
            continue
        try:
            if entry.stat().st_size == 0:
                corrupted.append(entry)
                continue
            with open(entry, "rb") as file:
                header = file.read(8)
            if not header:
                corrupted.append(entry)
        except OSError:
            corrupted.append(entry)

    if corrupted:
        warning(f"{len(corrupted)} cache(s) do Metro potencialmente corrompido(s).")
        for path in corrupted:
            info(f"  - {path}")
        purge_metro_cache()
    else:
        success("Caches do Metro íntegros.")


def start_in_new_console(title: str, command: str) -> subprocess.Popen:
    safe_title = title.replace("&", "^&")
    full_command = f"title {safe_title} && {command}"
    write_log(f"OPEN TERMINAL: {full_command}")
    return subprocess.Popen(
        ["cmd.exe", "/D", "/K", full_command],
        cwd=str(PROJECT_DIR),
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )


# ============================================================
# METRO
# ============================================================


def metro_already_running(port: int) -> bool:
    return not port_is_free(port)


def start_metro_terminal(port: int) -> subprocess.Popen:
    step(f"Iniciando Metro na porta {port}")
    command = (
        f'npx.cmd --no-install react-native start --port {port}'
    )
    process = start_in_new_console(
        f"TribeWallet - Metro {port}", command
    )
    LAUNCHER_PIDS.append(process.pid)
    success("Terminal do Metro aberto.")
    return process


def wait_for_metro_ready(port: int, timeout: float = BUNDLE_READY_TIMEOUT) -> bool:
    info(f"Aguardando Metro responder em http://localhost:{port}/status")
    started = time.time()
    while time.time() - started < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1.5) as sock:
                sock.sendall(b"GET /status HTTP/1.1\r\nHost: localhost\r\n\r\n")
                data = sock.recv(4096).decode("utf-8", errors="ignore")
                if "packager-status:running" in data:
                    success("Metro pronto.")
                    return True
        except OSError:
            pass
        time.sleep(LOG_POLL_INTERVAL)
    warning("Metro não respondeu dentro do tempo limite.")
    return False


# ============================================================
# GRADLE CLEAN
# ============================================================


def clean_android_build() -> None:
    step("Preparando build Android")
    android_dir = PROJECT_DIR / "android"
    gradlew = android_dir / "gradlew.bat"
    if not gradlew.exists():
        raise RuntimeError("gradlew.bat não encontrado.")
    info("Executando Gradle clean...")
    result = subprocess.run([str(gradlew), "clean"], cwd=str(android_dir))
    if result.returncode != 0:
        raise RuntimeError("Gradle clean falhou.")
    success("Gradle clean concluído.")


# ============================================================
# BUILD ANDROID
# ============================================================


def build_android(port: int) -> bool:
    step("Compilando e instalando aplicativo Android")
    info("O primeiro build pode demorar.")
    info(f"Metro configurado para porta {port}.")
    print()
    command = [
        "npx.cmd",
        "--no-install",
        "react-native",
        "run-android",
        "--port",
        str(port),
    ]
    write_log("ANDROID BUILD: " + " ".join(command))
    result = subprocess.run(command, cwd=str(PROJECT_DIR))
    if result.returncode != 0:
        error("React Native Android build falhou.")
        return False
    success("Aplicativo compilado e instalado.")
    return True


# ============================================================
# VERIFICAR APP
# ============================================================


def verify_application(adb_path: Path, device: str) -> bool:
    step("Verificando aplicativo no dispositivo")
    result = adb_command(
        adb_path,
        "-s",
        device,
        "shell",
        "pm",
        "list",
        "packages",
        capture=True,
    )
    if result.returncode != 0:
        warning("Não foi possível verificar o package.")
        return False
    package_line = f"package:{APP_ID}"
    if package_line in result.stdout:
        success(f"Package encontrado: {APP_ID}")
        return True
    warning(f"Package {APP_ID} não apareceu na lista.")
    return False


# ============================================================
# LOGCAT
# ============================================================


def start_logcat(adb_path: Path, device: str) -> subprocess.Popen:
    step("Abrindo monitor Logcat")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = LOG_DIR / f"logcat_{timestamp}.txt"
    write_log(f"Logcat: {log_file}")
    command = (
        f'"{adb_path}" -s {device} logcat > "{log_file}"'
    )
    process = start_in_new_console("TribeWallet - Android Logcat", command)
    LAUNCHER_PIDS.append(process.pid)
    success("Logcat aberto.")
    return process


# ============================================================
# ENCERRAMENTO
# ============================================================


def shutdown_all(adb_path: Path | None = None, device: str | None = None) -> None:
    global KEEP_RUNNING
    KEEP_RUNNING = False
    out()
    out("=" * 72, Fore.YELLOW)
    out("                  ENCERRANDO TUDO", Fore.YELLOW)
    out("=" * 72, Fore.YELLOW)

    # 1. Encerrar terminais CMD abertos pelo launcher
    if LAUNCHER_PIDS:
        for pid in LAUNCHER_PIDS:
            try:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(pid)],
                    capture_output=True,
                    check=False,
                )
            except Exception:
                pass

    # 2. Encerrar processos node (Metro) e java (gradle/build)
    for pattern in ("node.exe", "java.exe"):
        try:
            subprocess.run(
                ["taskkill", "/F", "/IM", pattern],
                capture_output=True,
                check=False,
            )
        except Exception:
            pass

    # 3. Encerrar processos filhos do cmd.exe (consoles CMD filhos)
    try:
        output = subprocess.check_output(
            ["wmic", "process", "where", "name='cmd.exe'", "get", "processid,parentprocessid"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
        for line in output.splitlines()[1:]:
            line = line.strip()
            if not line:
                continue
            try:
                pid_str, ppid_str = line.split()
            except ValueError:
                continue
            try:
                ppid = int(ppid_str)
            except ValueError:
                continue
            if ppid in LAUNCHER_PIDS:
                try:
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/PID", pid_str],
                        capture_output=True,
                        check=False,
                    )
                except Exception:
                    pass
    except Exception:
        pass

    # 4. Encerrar emulador (se houver)
    if adb_path is not None:
        try:
            subprocess.run(
                [str(adb_path), "emu", "kill"],
                capture_output=True,
                check=False,
            )
        except Exception:
            pass

    success("Tudo encerrado.")


# ============================================================
# MONITOR
# ============================================================


def monitor_loop(adb_path: Path) -> None:
    global KEEP_RUNNING
    while KEEP_RUNNING:
        try:
            command = sys.stdin.readline()
        except Exception:
            break
        if not command:
            break
        stripped = command.strip().lower()
        if stripped in ("0", "q", "quit", "exit", "sair"):
            KEEP_RUNNING = False
            shutdown_all(adb_path)
            break
        if stripped in ("c", "cache", "clean"):
            purge_metro_cache()
            print("Cache limpo. Reinicie o Metro manualmente para aplicar.", flush=True)


# ============================================================
# INFO FINAL
# ============================================================


def print_summary(device: str, port: int) -> None:
    print()
    out("=" * 72, Fore.GREEN)
    out("                  TRIBEWALLET INICIADO", Fore.GREEN)
    out("=" * 72, Fore.GREEN)
    print()
    out(f"Projeto       : {PROJECT_DIR}")
    out(f"Dispositivo   : {device}")
    out(f"Metro         : {port}")
    out(f"Tempo total   : {elapsed()}")
    out(f"Log           : {CURRENT_LOG_FILE}")
    print()
    out("Terminais ativos:", Fore.CYAN)
    out("  [1] Android Emulator")
    out("  [2] Metro Bundler")
    out("  [3] Android Logcat")
    print()
    out("Comandos disponíveis:", Fore.CYAN)
    out("  [0] Encerrar tudo (terminais + emulador)", Fore.YELLOW)
    out("  [c] Limpar caches do Metro", Fore.YELLOW)
    out("  [ENTER] apenas finaliza este launcher", Fore.YELLOW)
    print()
    out("=" * 72, Fore.GREEN)
    print()


# ============================================================
# MAIN
# ============================================================


def main() -> None:
    global MONITOR_THREAD

    create_directories()
    create_log_file()
    print_header()
    info(f"Log salvo em: {CURRENT_LOG_FILE}")

    validate_project()
    check_tool("node")
    check_tool("npm")
    check_tool("npx")

    sdk, adb_path, emulator_path = find_android_tools()
    start_adb(adb_path)

    validate_metro_cache()

    step("Verificando dispositivos Android")
    device = get_ready_device(adb_path)
    if device:
        success(f"Dispositivo já ativo: {device}")
    else:
        warning("Nenhum dispositivo Android ativo.")
        step("Detectando Android Virtual Devices")
        avds = get_avds(emulator_path)
        if not avds:
            raise RuntimeError(
                "Nenhum AVD encontrado.\n\n"
                "Abra o Android Studio > Device Manager "
                "e crie um emulador."
            )
        out("AVDs encontrados:", Fore.CYAN)
        for index, avd in enumerate(avds, start=1):
            out(f"  [{index}] {avd}")
        selected_avd = avds[0]
        info(f"Selecionado automaticamente: {selected_avd}")
        start_emulator(emulator_path, selected_avd)
        device = wait_for_device(adb_path)

    wait_for_boot(adb_path, device)

    # Limpar porta Metro anterior e escolher porta aleatória
    step("Preparando porta Metro")
    port = find_random_metro_port()
    if not port_is_free(port):
        kill_process_by_port(port)
        time.sleep(1)
        if not port_is_free(port):
            warning(f"Porta {port} ainda ocupada, sorteando outra.")
            port = find_random_metro_port()

    clean_android_build()

    start_metro_terminal(port)
    if not wait_for_metro_ready(port):
        warning("Continuando mesmo assim; o app pode demorar no primeiro bundle.")

    if not build_android(port):
        error("Build Android falhou. Verifique o log e tente novamente.")
        print_summary(device, port)
        MONITOR_THREAD = Thread(target=monitor_loop, args=(adb_path,), daemon=True)
        MONITOR_THREAD.start()
        try:
            while KEEP_RUNNING:
                time.sleep(0.5)
        except KeyboardInterrupt:
            KEEP_RUNNING = False
        shutdown_all(adb_path, device)
        return

    if not verify_application(adb_path, device):
        warning("Verificação do app falhou, mas seguindo.")

    start_logcat(adb_path, device)

    print_summary(device, port)

    MONITOR_THREAD = Thread(target=monitor_loop, args=(adb_path,), daemon=True)
    MONITOR_THREAD.start()

    try:
        while KEEP_RUNNING:
            time.sleep(0.5)
    except KeyboardInterrupt:
        KEEP_RUNNING = False
    finally:
        shutdown_all(adb_path, device)


# ============================================================
# EXECUÇÃO
# ============================================================


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        warning("Launcher interrompido pelo usuário.")
        shutdown_all()
    except Exception as exc:
        print()
        error(str(exc))
        write_log("FATAL ERROR: " + repr(exc))
        print()
        out(f"Log completo: {CURRENT_LOG_FILE}", Fore.YELLOW)
        print()
        input("ENTER para fechar...")
