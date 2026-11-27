# Atalhos do app. Uso: make device pixel9a (emulador) e, em outro terminal, make mobile-run.
ANDROID_SDK := $(or $(ANDROID_HOME),$(HOME)/Android/Sdk)
EMULATOR ?= $(ANDROID_SDK)/emulator/emulator
ADB ?= $(ANDROID_SDK)/platform-tools/adb

.PHONY: test device pixel9a mobile-run permissao

test:
	npx jest

# "make device pixel9a" sobe o Pixel 9a renderizando na GPU.
device:
	$(EMULATOR) -avd Pixel_9a -gpu host

pixel9a:
	@:

# Antes de abrir o app, tenta liberar a rede local no Expo Go (sem isso o app não alcança a API no Android 17).
mobile-run:
	@$(ADB) shell pm grant host.exp.exponent android.permission.ACCESS_LOCAL_NETWORK >/dev/null 2>&1 || echo "Aviso: permissão de rede local não aplicada. Com o Expo Go instalado, rode: make permissao"
	npx expo start --go --android

permissao:
	$(ADB) shell pm grant host.exp.exponent android.permission.ACCESS_LOCAL_NETWORK
