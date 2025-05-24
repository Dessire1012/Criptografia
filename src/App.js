import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [cipher, setCipher] = useState("cesar");
  const [result, setResult] = useState("");
  const [matrix, setMatrix] = useState([]);

  const cesar = (txt, shift = 3, decrypt = false) => {
    if (decrypt) shift = -shift;
    return txt
      .split("")
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90)
          return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
        else if (code >= 97 && code <= 122)
          return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
        else return c;
      })
      .join("");
  };

  const vigenere = (txt, keyword, decrypt = false) => {
    let result = "";
    keyword = keyword.toLowerCase();
    let j = 0;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      const k = keyword[j % keyword.length].charCodeAt(0) - 97;
      if (/[a-zA-Z]/.test(c)) {
        const base = c === c.toLowerCase() ? 97 : 65;
        const offset = c.charCodeAt(0) - base;
        const shifted = decrypt ? (offset - k + 26) % 26 : (offset + k) % 26;
        result += String.fromCharCode(shifted + base);
        j++;
      } else {
        result += c;
      }
    }
    return result;
  };

  const espartano = (txt, columns, decrypt = false) => {
    columns = parseInt(columns);
    if (!columns || columns < 1) return "";

    const rows = Math.ceil(txt.length / columns);
    const fullLength = rows * columns;
    const padded = txt.padEnd(fullLength, " ");

    if (!decrypt) {
      // CIFRADO: escribir por filas, leer por columnas
      const matrix = [];
      for (let r = 0; r < rows; r++) {
        matrix.push(padded.slice(r * columns, (r + 1) * columns).split(""));
      }

      // Armar texto cifrado con separación por columnas
      const encryptedCols = [];
      for (let c = 0; c < columns; c++) {
        let colText = "";
        for (let r = 0; r < rows; r++) {
          colText += matrix[r][c];
        }
        encryptedCols.push(colText.trim());
      }

      const encrypted = encryptedCols.join(" ").trim(); // con espacios entre columnas

      return {
        encrypted,
        matrix,
      };
    } else {
      // DESCIFRADO: reconstruir matriz llenando por columnas correctamente
      const cleanText = txt.replace(/\s+/g, "");
      const numChars = cleanText.length;
      const rows = Math.ceil(numChars / columns);
      const fullLength = rows * columns;
      const matrix = Array.from({ length: rows }, () =>
        Array(columns).fill("")
      );

      let shortCols = fullLength - numChars; // columnas que tendrán una fila menos
      let index = 0;

      for (let c = 0; c < columns; c++) {
        const currentRows = c >= columns - shortCols ? rows - 1 : rows;

        for (let r = 0; r < currentRows; r++) {
          matrix[r][c] = cleanText[index++] || " ";
        }
      }

      return {
        decrypted: matrix
          .map((row) => row.join(""))
          .join("")
          .trim(),
        matrix,
      };
    }
  };

  const handleEncrypt = () => {
    switch (cipher) {
      case "cesar":
        setMatrix([]);
        setResult(cesar(text, 3, false));
        break;
      case "vigenere":
        setMatrix([]);
        setResult(vigenere(text, key, false));
        break;
      case "espartano": {
        const { encrypted, matrix } = espartano(text, key, false);
        setMatrix(matrix);
        setResult(encrypted);
        break;
      }
      default:
        setMatrix([]);
        setResult("");
    }
  };

  const sanitizeKey = (key) => {
    return key.toLowerCase().replace(/[^a-z]/g, "");
  };

  const handleDecrypt = () => {
    const input = result.trim(); // usar el texto cifrado actual
    switch (cipher) {
      case "cesar":
        setMatrix([]);
        setResult(cesar(input, 3, true));
        break;
      case "vigenere":
        setMatrix([]);
        setResult(vigenere(input, sanitizeKey(key), true));
        break;
      case "espartano": {
        const { decrypted } = espartano(input, key, true);
        setMatrix([]); // limpiar matriz, porque en descifrado no necesitas verla
        setResult(decrypted);
        break;
      }
      default:
        setMatrix([]);
        setResult("");
    }
  };

  useEffect(() => {
    setText("");
    setKey("");
    setResult("");
  }, [cipher]);

  const handleTextChange = (e) => {
    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setText(onlyLetters);
  };

  const handleKeyChange = (e) => {
    const onlyLetters = e.target.value.replace(/[^a-zA-Z]/g, "");
    setKey(onlyLetters);
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Cifrador</h1>

      <div className="mb-3">
        <label className="form-label">Tipo de cifrado:</label>
        <select
          className="form-select"
          value={cipher}
          onChange={(e) => setCipher(e.target.value)}
        >
          <option value="cesar">César</option>
          <option value="vigenere">Vigenère</option>
          <option value="espartano">Espartano</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Texto:</label>
        <textarea
          className="form-control"
          rows="4"
          value={text}
          onChange={handleTextChange}
        />
      </div>

      {cipher === "vigenere" && (
        <div className="mb-3">
          <label className="form-label">Clave (solo letras):</label>
          <input
            type="text"
            className="form-control"
            value={key}
            onChange={handleKeyChange}
            placeholder="Texto como clave"
          />
        </div>
      )}

      {cipher === "espartano" && (
        <div className="mb-3">
          <label className="form-label">Número de columnas:</label>
          <input
            type="number"
            className="form-control"
            value={key}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
              setKey(onlyNumbers);
            }}
            min="1"
            placeholder="Ej: 4"
          />
        </div>
      )}

      <div className="mb-4">
        <button className="btn btn-primary me-2" onClick={handleEncrypt}>
          Cifrar
        </button>
        <button className="btn btn-secondary" onClick={handleDecrypt}>
          Descifrar
        </button>
      </div>

      <div className="card">
        <div className="card-header">Resultado</div>
        <div className="card-body">
          <pre className="mb-0">{result}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
