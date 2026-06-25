import requests
import re
import os
from bs4 import BeautifulSoup

def get_current_jus():
    url = "https://www.abogado.org.ar/valores-y-tasas/"
    # Simular ser un navegador normal para evitar bloqueo anti-bot 403
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Analizar HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar el texto "Valor Jus" y extraer el número
        # Formato esperado: Valor Jus $45.738,02
        text = soup.get_text()
        match = re.search(r'Valor Jus.*?\$?\s*([\d\.,]+)', text, re.IGNORECASE)
        
        if match:
            return match.group(1).strip()
        else:
            print("No se encontró el patrón de Valor Jus en la página.")
            return None
            
    except Exception as e:
        print(f"Error al obtener el valor: {e}")
        return None

def update_app_js(new_value):
    app_js_path = "app.js"
    if not os.path.exists(app_js_path):
        print(f"Archivo {app_js_path} no encontrado.")
        return
        
    with open(app_js_path, "r", encoding="utf-8") as file:
        content = file.read()
        
    # Reemplazar la línea paymentLabel: "1 JUS ($XXXXX)",
    # Usamos regex para atrapar cualquier valor anterior
    new_content = re.sub(
        r'paymentLabel:\s*"1 JUS \(\$[^)]+\)"',
        f'paymentLabel: "1 JUS (${new_value})"',
        content
    )
    
    if content != new_content:
        with open(app_js_path, "w", encoding="utf-8") as file:
            file.write(new_content)
        print(f"app.js actualizado con el nuevo valor: ${new_value}")
    else:
        print("El valor del JUS no ha cambiado o no se pudo reemplazar.")

if __name__ == "__main__":
    jus_value = get_current_jus()
    if jus_value:
        print(f"Valor JUS extraído: {jus_value}")
        update_app_js(jus_value)
    else:
        print("Fallo en la extracción. No se modifica app.js")
