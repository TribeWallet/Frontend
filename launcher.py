import os
import sys
import time
import socket
import shutil
import subprocess
from pathlib import Path
from datetime import datetime


# ============================================================
# TRIBEWALLET NATIVE
# PROFESSIONAL WINDOWS DEV LAUNCHER
# ============================================================

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


colorama_init(
    autoreset=True
)


# ============================================================
# CONFIGURAÇÃO
# ============================================================

PROJECT_DIR = Path(__file__).resolve().parent

TMP_DIR = PROJECT_DIR / ".tmp"

LOG_DIR = TMP_DIR / "logs"

METRO_PORT_START = 8081
METRO_PORT_END = 8099

DEVICE_TIMEOUT = 180
BOOT_TIMEOUT = 180

METRO_START_WAIT = 5

APP_ID = "com.tribewalletnative"


# ============================================================
# ESTADO
# ============================================================

START_TIME = time.time()

STEP_COUNTER = 0

CURRENT_LOG_FILE = None


# ============================================================
# DIRETÓRIOS
# ============================================================

def create_directories():

    TMP_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    LOG_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


# ============================================================
# LOG FILE
# ============================================================

def create_log_file():

    global CURRENT_LOG_FILE

    timestamp = datetime.now().strftime(
        "%Y-%m-%d_%H-%M-%S"
    )

    CURRENT_LOG_FILE = (
        LOG_DIR
        / f"launcher_{timestamp}.log"
    )

    CURRENT_LOG_FILE.touch(
        exist_ok=True
    )


def write_log(message):

    if CURRENT_LOG_FILE is None:
        return

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    try:

        with open(
            CURRENT_LOG_FILE,
            "a",
            encoding="utf-8"
        ) as file:

            file.write(
                f"[{timestamp}] {message}\n"
            )

    except Exception:
        pass


# ============================================================
# OUTPUT
# ============================================================

def out(
    message="",
    color=None
):

    if color:

        print(
            color
            + message
            + Style.RESET_ALL,
            flush=True
        )

    else:

        print(
            message,
            flush=True
        )

    write_log(message)


def info(message):

    out(
        f"[INFO] {message}",
        Fore.CYAN
    )


def success(message):

    out(
        f"[ OK ] {message}",
        Fore.GREEN
    )


def warning(message):

    out(
        f"[WARN] {message}",
        Fore.YELLOW
    )


def error(message):

    out(
        f"[ERRO] {message}",
        Fore.RED
    )


# ============================================================
# TEMPO
# ============================================================

def elapsed():

    seconds = int(
        time.time() - START_TIME
    )

    minutes = seconds // 60

    seconds = seconds % 60

    return f"{minutes:02d}:{seconds:02d}"


# ============================================================
# HEADER
# ============================================================

def print_header():

    print()

    out(
        "=" * 72,
        Fore.BLUE
    )

    out(
        "                    TRIBEWALLET NATIVE",
        Fore.CYAN
    )

    out(
        "                 PROFESSIONAL DEV LAUNCHER",
        Fore.CYAN
    )

    out(
        "=" * 72,
        Fore.BLUE
    )

    print()

    out(
        f"Projeto : {PROJECT_DIR}",
        Fore.WHITE
    )

    out(
        f"Python  : {sys.version.split()[0]}",
        Fore.WHITE
    )

    out(
        f"Tempo   : {elapsed()}",
        Fore.WHITE
    )

    print()


# ============================================================
# STEP
# ============================================================

def step(title):

    global STEP_COUNTER

    STEP_COUNTER += 1

    print()

    out(
        "-" * 72,
        Fore.BLUE
    )

    out(
        f"[{STEP_COUNTER:02d}] {title}",
        Fore.CYAN
    )

    out(
        "-" * 72,
        Fore.BLUE
    )


# ============================================================
# COMANDOS WINDOWS
# ============================================================

def find_command(name):

    # Primeiro tenta diretamente pelo PATH

    path = shutil.which(name)

    if path:
        return path

    # Windows costuma usar .cmd

    extensions = [
        ".cmd",
        ".exe",
        ".bat"
    ]

    for extension in extensions:

        path = shutil.which(
            name + extension
        )

        if path:
            return path

    return None


# ============================================================
# EXECUTAR COMANDO
# ============================================================

def run_command(
    command,
    cwd=None,
    timeout=None,
    capture=False
):

    write_log(
        "COMMAND: "
        + " ".join(
            str(x)
            for x in command
        )
    )

    try:

        return subprocess.run(
            command,
            cwd=str(
                cwd or PROJECT_DIR
            ),
            timeout=timeout,
            capture_output=capture,
            text=True,
            shell=False
        )

    except FileNotFoundError:

        raise RuntimeError(
            "Executável não encontrado: "
            + str(command[0])
        )

    except subprocess.TimeoutExpired:

        raise RuntimeError(
            "Comando excedeu o tempo limite."
        )


# ============================================================
# NODE
# ============================================================

def check_node():

    step(
        "Verificando Node.js"
    )

    node = find_command(
        "node"
    )

    if not node:

        raise RuntimeError(
            "Node.js não encontrado no PATH."
        )

    result = run_command(
        [
            node,
            "--version"
        ],
        capture=True
    )

    if result.returncode != 0:

        raise RuntimeError(
            "Node.js retornou erro:\n"
            + result.stderr
        )

    version = result.stdout.strip()

    success(
        f"Node.js encontrado: {version}"
    )

    info(
        f"Executável: {node}"
    )

    return node


# ============================================================
# NPM
# ============================================================

def check_npm():

    step(
        "Verificando npm"
    )

    npm = find_command(
        "npm"
    )

    if not npm:

        raise RuntimeError(
            "npm não encontrado no PATH."
        )

    result = run_command(
        [
            npm,
            "--version"
        ],
        capture=True
    )

    if result.returncode != 0:

        raise RuntimeError(
            "npm retornou erro:\n"
            + result.stderr
        )

    version = result.stdout.strip()

    success(
        f"npm encontrado: {version}"
    )

    info(
        f"Executável: {npm}"
    )

    return npm


# ============================================================
# NPX
# ============================================================

def check_npx():

    step(
        "Verificando npx"
    )

    npx = find_command(
        "npx"
    )

    if not npx:

        raise RuntimeError(
            "npx não encontrado no PATH."
        )

    result = run_command(
        [
            npx,
            "--version"
        ],
        capture=True
    )

    if result.returncode != 0:

        raise RuntimeError(
            "npx retornou erro:\n"
            + result.stderr
        )

    version = result.stdout.strip()

    success(
        f"npx encontrado: {version}"
    )

    info(
        f"Executável: {npx}"
    )

    return npx


# ============================================================
# PROJETO
# ============================================================

def validate_project():

    step(
        "Validando projeto React Native"
    )

    package_json = (
        PROJECT_DIR
        / "package.json"
    )

    android_dir = (
        PROJECT_DIR
        / "android"
    )

    node_modules = (
        PROJECT_DIR
        / "node_modules"
    )

    if not package_json.exists():

        raise RuntimeError(
            "package.json não encontrado."
        )

    success(
        "package.json encontrado."
    )

    if not android_dir.exists():

        raise RuntimeError(
            "Pasta android não encontrada."
        )

    success(
        "Pasta android encontrada."
    )

    if not node_modules.exists():

        warning(
            "node_modules não existe."
        )

        info(
            "Execute npm install antes de iniciar."
        )

    else:

        success(
            "node_modules encontrado."
        )


# ============================================================
# ANDROID SDK
# ============================================================

def find_android_sdk():

    candidates = []

    android_home = os.environ.get(
        "ANDROID_HOME"
    )

    android_sdk_root = os.environ.get(
        "ANDROID_SDK_ROOT"
    )

    local_app_data = os.environ.get(
        "LOCALAPPDATA"
    )

    if android_home:

        candidates.append(
            Path(android_home)
        )

    if android_sdk_root:

        candidates.append(
            Path(android_sdk_root)
        )

    if local_app_data:

        candidates.append(
            Path(local_app_data)
            / "Android"
            / "Sdk"
        )

    for path in candidates:

        if path.exists():

            return path

    return None


def find_android_tools():

    step(
        "Localizando Android SDK"
    )

    sdk = find_android_sdk()

    if not sdk:

        raise RuntimeError(
            "Android SDK não encontrado."
        )

    adb_path = (
        sdk
        / "platform-tools"
        / "adb.exe"
    )

    emulator_path = (
        sdk
        / "emulator"
        / "emulator.exe"
    )

    if not adb_path.exists():

        raise RuntimeError(
            "adb.exe não encontrado:\n"
            + str(adb_path)
        )

    if not emulator_path.exists():

        raise RuntimeError(
            "emulator.exe não encontrado:\n"
            + str(emulator_path)
        )

    success(
        f"Android SDK: {sdk}"
    )

    info(
        f"ADB: {adb_path}"
    )

    info(
        f"Emulator: {emulator_path}"
    )

    return (
        sdk,
        adb_path,
        emulator_path
    )


# ============================================================
# ADB
# ============================================================

def adb_command(
    adb_path,
    *args,
    capture=True
):

    return run_command(
        [
            str(adb_path),
            *args
        ],
        capture=capture
    )


def start_adb(
    adb_path
):

    step(
        "Iniciando Android Debug Bridge"
    )

    result = adb_command(
        adb_path,
        "start-server"
    )

    if result.returncode != 0:

        raise RuntimeError(
            "Falha ao iniciar ADB:\n"
            + result.stderr
        )

    success(
        "ADB iniciado."
    )


# ============================================================
# DISPOSITIVOS
# ============================================================

def get_devices(
    adb_path
):

    result = adb_command(
        adb_path,
        "devices"
    )

    if result.returncode != 0:

        return []

    devices = []

    for line in result.stdout.splitlines():

        line = line.strip()

        if not line:
            continue

        if line.startswith(
            "List of devices"
        ):
            continue

        parts = line.split()

        if len(parts) >= 2:

            devices.append(
                (
                    parts[0],
                    parts[1]
                )
            )

    return devices


def get_ready_device(
    adb_path
):

    devices = get_devices(
        adb_path
    )

    for serial, state in devices:

        if state == "device":

            return serial

    return None


# ============================================================
# AVD
# ============================================================

def get_avds(
    emulator_path
):

    result = run_command(
        [
            str(emulator_path),
            "-list-avds"
        ],
        capture=True
    )

    if result.returncode != 0:

        raise RuntimeError(
            "Não foi possível listar os AVDs:\n"
            + result.stderr
        )

    avds = []

    for line in result.stdout.splitlines():

        line = line.strip()

        if line:

            avds.append(line)

    return avds


def start_emulator(
    emulator_path,
    avd
):

    info(
        f"Iniciando AVD: {avd}"
    )

    subprocess.Popen(
        [
            str(emulator_path),
            "-avd",
            avd,
            "-netdelay",
            "none",
            "-netspeed",
            "full"
        ],
        cwd=str(PROJECT_DIR),
        creationflags=(
            subprocess.CREATE_NEW_CONSOLE
        )
    )


# ============================================================
# AGUARDAR DEVICE
# ============================================================

def wait_for_device(
    adb_path
):

    step(
        "Aguardando dispositivo Android"
    )

    started = time.time()

    dots = 0

    while (
        time.time() - started
        < DEVICE_TIMEOUT
    ):

        device = get_ready_device(
            adb_path
        )

        if device:

            success(
                f"Dispositivo conectado: {device}"
            )

            return device

        dots += 1

        if dots % 5 == 0:

            elapsed_seconds = int(
                time.time() - started
            )

            info(
                f"Aguardando... "
                f"{elapsed_seconds}s"
            )

        time.sleep(2)

    raise TimeoutError(
        "O Android não ficou disponível "
        "dentro do tempo limite."
    )


# ============================================================
# BOOT COMPLETO
# ============================================================

def wait_for_boot(
    adb_path,
    device
):

    step(
        "Aguardando boot completo do Android"
    )

    started = time.time()

    while (
        time.time() - started
        < BOOT_TIMEOUT
    ):

        result = adb_command(
            adb_path,
            "-s",
            device,
            "shell",
            "getprop",
            "sys.boot_completed"
        )

        if (
            result.returncode == 0
            and result.stdout.strip() == "1"
        ):

            success(
                "Android inicializado completamente."
            )

            return

        time.sleep(2)

    raise TimeoutError(
        "Timeout aguardando boot completo."
    )


# ============================================================
# PORTA
# ============================================================

def port_is_free(
    port
):

    sock = socket.socket(
        socket.AF_INET,
        socket.SOCK_STREAM
    )

    try:

        sock.settimeout(
            0.25
        )

        return (
            sock.connect_ex(
                (
                    "127.0.0.1",
                    port
                )
            )
            != 0
        )

    finally:

        sock.close()


def find_metro_port():

    step(
        "Procurando porta Metro disponível"
    )

    for port in range(
        METRO_PORT_START,
        METRO_PORT_END + 1
    ):

        if port_is_free(port):

            success(
                f"Porta disponível: {port}"
            )

            return port

        info(
            f"Porta {port} ocupada."
        )

    raise RuntimeError(
        f"Nenhuma porta disponível entre "
        f"{METRO_PORT_START} e "
        f"{METRO_PORT_END}."
    )


# ============================================================
# TERMINAL NOVO
# ============================================================

def open_terminal(
    title,
    command
):

    """
    Abre uma janela CMD separada.

    Não utiliza caminhos de npm/npx.
    O próprio PATH do Windows resolve
    npx.cmd corretamente.
    """

    safe_title = title.replace(
        "&",
        "^&"
    )

    full_command = (
        f'title {safe_title} && '
        f'{command}'
    )

    write_log(
        f"OPEN TERMINAL: {full_command}"
    )

    subprocess.Popen(
        [
            "cmd.exe",
            "/D",
            "/K",
            full_command
        ],
        cwd=str(PROJECT_DIR),
        creationflags=(
            subprocess.CREATE_NEW_CONSOLE
        )
    )


# ============================================================
# METRO
# ============================================================

def start_metro(
    port
):

    step(
        f"Iniciando Metro na porta {port}"
    )

    command = (
        f'npx.cmd react-native start '
        f'--port {port} '
        f'--reset-cache'
    )

    open_terminal(
        f"TribeWallet - Metro {port}",
        command
    )

    success(
        "Terminal do Metro aberto."
    )


# ============================================================
# GRADLE CLEAN
# ============================================================

def clean_android_build():

    step(
        "Preparando build Android"
    )

    android_dir = (
        PROJECT_DIR
        / "android"
    )

    gradlew = (
        android_dir
        / "gradlew.bat"
    )

    if not gradlew.exists():

        raise RuntimeError(
            "gradlew.bat não encontrado."
        )

    info(
        "Executando Gradle clean..."
    )

    result = subprocess.run(
        [
            str(gradlew),
            "clean"
        ],
        cwd=str(android_dir)
    )

    if result.returncode != 0:

        raise RuntimeError(
            "Gradle clean falhou."
        )

    success(
        "Gradle clean concluído."
    )


# ============================================================
# BUILD ANDROID
# ============================================================

def build_android(
    port
):

    step(
        "Compilando e instalando aplicativo Android"
    )

    info(
        "O primeiro build pode demorar."
    )

    info(
        f"Metro configurado para porta {port}."
    )

    print()

    command = [
        "npx.cmd",
        "react-native",
        "run-android",
        "--port",
        str(port)
    ]

    write_log(
        "ANDROID BUILD: "
        + " ".join(command)
    )

    result = subprocess.run(
        command,
        cwd=str(PROJECT_DIR)
    )

    if result.returncode != 0:

        raise RuntimeError(
            "React Native Android build falhou."
        )

    success(
        "Aplicativo compilado e instalado."
    )


# ============================================================
# VERIFICAR APP
# ============================================================

def verify_application(
    adb_path,
    device
):

    step(
        "Verificando aplicativo no dispositivo"
    )

    result = adb_command(
        adb_path,
        "-s",
        device,
        "shell",
        "pm",
        "list",
        "packages",
        capture=True
    )

    if result.returncode != 0:

        warning(
            "Não foi possível verificar o package."
        )

        return

    package_line = (
        "package:"
        + APP_ID
    )

    if package_line in result.stdout:

        success(
            f"Package encontrado: {APP_ID}"
        )

    else:

        warning(
            f"Package {APP_ID} não apareceu na lista."
        )


# ============================================================
# LOGCAT
# ============================================================

def start_logcat(
    adb_path,
    device
):

    step(
        "Abrindo monitor Logcat"
    )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    log_file = (
        LOG_DIR
        / f"logcat_{timestamp}.txt"
    )

    write_log(
        f"Logcat: {log_file}"
    )

    command = (
        f'"{adb_path}" '
        f'-s {device} '
        f'logcat'
        f' > "{log_file}"'
    )

    open_terminal(
        "TribeWallet - Android Logcat",
        command
    )

    success(
        "Logcat aberto."
    )


# ============================================================
# INFO FINAL
# ============================================================

def print_summary(
    device,
    port
):

    total_time = elapsed()

    print()

    out(
        "=" * 72,
        Fore.GREEN
    )

    out(
        "                  TRIBEWALLET INICIADO",
        Fore.GREEN
    )

    out(
        "=" * 72,
        Fore.GREEN
    )

    print()

    out(
        f"Projeto       : {PROJECT_DIR}"
    )

    out(
        f"Dispositivo   : {device}"
    )

    out(
        f"Metro         : {port}"
    )

    out(
        f"Tempo total   : {total_time}"
    )

    out(
        f"Log           : {CURRENT_LOG_FILE}"
    )

    print()

    out(
        "Terminais ativos:",
        Fore.CYAN
    )

    out(
        "  [1] Android Emulator"
    )

    out(
        "  [2] Metro Bundler"
    )

    out(
        "  [3] Android Build"
    )

    out(
        "  [4] Android Logcat"
    )

    print()

    out(
        "=" * 72,
        Fore.GREEN
    )

    print()


# ============================================================
# MAIN
# ============================================================

def main():

    create_directories()

    create_log_file()

    print_header()

    info(
        f"Log salvo em: {CURRENT_LOG_FILE}"
    )

    # --------------------------------------------------------
    # Projeto
    # --------------------------------------------------------

    validate_project()

    # --------------------------------------------------------
    # Node
    # --------------------------------------------------------

    check_node()

    # --------------------------------------------------------
    # npm
    # --------------------------------------------------------

    check_npm()

    # --------------------------------------------------------
    # npx
    # --------------------------------------------------------

    check_npx()

    # --------------------------------------------------------
    # Android SDK
    # --------------------------------------------------------

    (
        sdk,
        adb_path,
        emulator_path
    ) = find_android_tools()

    # --------------------------------------------------------
    # ADB
    # --------------------------------------------------------

    start_adb(
        adb_path
    )

    # --------------------------------------------------------
    # Procurar device
    # --------------------------------------------------------

    step(
        "Verificando dispositivos Android"
    )

    device = get_ready_device(
        adb_path
    )

    if device:

        success(
            f"Dispositivo já ativo: {device}"
        )

    else:

        warning(
            "Nenhum dispositivo Android ativo."
        )

        # ----------------------------------------------------
        # AVD
        # ----------------------------------------------------

        step(
            "Detectando Android Virtual Devices"
        )

        avds = get_avds(
            emulator_path
        )

        if not avds:

            raise RuntimeError(
                "Nenhum AVD encontrado.\n\n"
                "Abra o Android Studio > Device Manager "
                "e crie um emulador."
            )

        out(
            "AVDs encontrados:",
            Fore.CYAN
        )

        for index, avd in enumerate(
            avds,
            start=1
        ):

            out(
                f"  [{index}] {avd}"
            )

        # ----------------------------------------------------
        # Seleção automática
        # ----------------------------------------------------

        selected_avd = avds[0]

        info(
            f"Selecionado automaticamente: {selected_avd}"
        )

        start_emulator(
            emulator_path,
            selected_avd
        )

        # ----------------------------------------------------
        # Esperar device
        # ----------------------------------------------------

        device = wait_for_device(
            adb_path
        )

    # --------------------------------------------------------
    # Boot
    # --------------------------------------------------------

    wait_for_boot(
        adb_path,
        device
    )

    # --------------------------------------------------------
    # Porta Metro
    # --------------------------------------------------------

    port = find_metro_port()

    # --------------------------------------------------------
    # IMPORTANTE
    #
    # Primeiro garantimos que o projeto Android está
    # consistente antes de abrir o Metro.
    # --------------------------------------------------------

    clean_android_build()

    # --------------------------------------------------------
    # Metro
    #
    # Abrimos Metro antes do run-android para que o CLI
    # consiga conectar ao servidor.
    # --------------------------------------------------------

    start_metro(
        port
    )

    info(
        f"Aguardando Metro {METRO_START_WAIT}s..."
    )

    time.sleep(
        METRO_START_WAIT
    )

    # --------------------------------------------------------
    # Build
    # --------------------------------------------------------

    build_android(
        port
    )

    # --------------------------------------------------------
    # Verificar package
    # --------------------------------------------------------

    verify_application(
        adb_path,
        device
    )

    # --------------------------------------------------------
    # Logcat
    # --------------------------------------------------------

    start_logcat(
        adb_path,
        device
    )

    # --------------------------------------------------------
    # Final
    # --------------------------------------------------------

    print_summary(
        device,
        port
    )

    input(
        "Pressione ENTER para fechar o launcher..."
    )


# ============================================================
# EXECUÇÃO
# ============================================================

if __name__ == "__main__":

    try:

        main()

    except KeyboardInterrupt:

        print()

        warning(
            "Launcher interrompido pelo usuário."
        )

        print()

        input(
            "ENTER para fechar..."
        )

    except Exception as exc:

        print()

        error(
            str(exc)
        )

        write_log(
            "FATAL ERROR: "
            + repr(exc)
        )

        print()

        out(
            f"Log completo: {CURRENT_LOG_FILE}",
            Fore.YELLOW
        )

        print()

        input(
            "ENTER para fechar..."
        )