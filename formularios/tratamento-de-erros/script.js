class FormValidator {
  constructor(formId) {
    this.formulario = document.getElementById(formId);
    this.errorSummary = this._createErrorSummary();
    this.elementos = this.formulario.querySelectorAll("input, select");
    this.processedGroups = new Set();
    this._bindEvents();
  }

  _bindEvents() {
    this.formulario.addEventListener("submit", (e) =>
      this._validateOnSubmit(e)
    );
    this.elementos.forEach((elemento) => {
      elemento.addEventListener("blur", () => {
        this._isValid(elemento);
      });
    });
  }

  _createErrorSummary() {
    const summary = document.createElement("div");
    summary.id = "errorSummary";
    summary.innerHTML = `<h3 tabindex="-1" id="headerErrorSummary">Existem erros no preenchimento do formulário</h3><ul></ul>`;
    summary.style.display = "none";
    this.formulario.insertBefore(summary, this.formulario.firstChild);
    return summary;
  }

  _updateErrorSummary(messages) {
    const list = this.errorSummary.querySelector("ul");
    list.innerHTML = "";
    messages.forEach(({ ...msg }) => {
      let labelText;
      if (msg.type === "radio" || msg.type === "checkbox") {
        labelText = this._getTextLegend(msg.id);
      } else {
        labelText = this._getTextLabel(msg.id);
      }

      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="#${msg.id}">${labelText}: ${msg.erroMsg}</a>`;
      list.appendChild(listItem);
    });
  }

  _getTextLabel(id) {
    let labelText = "Campo";
    const label = this.formulario.querySelector(`label[for="${id}"]`);
    labelText = label ? label.textContent : "Campo";
    return this._clearText(labelText);
  }

  _getTextLegend(id) {
    let labelText = "Opção";
    const fieldset = document.getElementById(id).closest("fieldset");

    if (fieldset) {
      const legend = fieldset.querySelector("legend");
      labelText = legend ? legend.textContent : "Opção";
    } else {
      labelText = this._getTextLabel(id);
    }
    return this._clearText(labelText);
  }

  _clearText(label) {
    return label
      .trim()
      .replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙãõÃÕçÇâÂýÝñÑ]/g, "");
  }

  _validateOnSubmit(e) {
    let valido = true;
    const errorMessages = [];
    this.processedGroups.clear();

    this.elementos.forEach((elemento) => {
      const isRadioOrCheckbox =
        elemento.type === "radio" || elemento.type === "checkbox";
      const groupName = elemento.name;

      if (isRadioOrCheckbox && this.processedGroups.has(groupName)) {
        return;
      }

      const validacao = this._isValid(elemento);
      if (!validacao.isValid) {
        validacao.id = elemento.id;
        errorMessages.push(validacao);
        valido = false;
        if (isRadioOrCheckbox) {
          this.processedGroups.add(groupName);
        }
      }
    });

    if (!valido) {
      e.preventDefault();
      this._updateErrorSummary(errorMessages);
      this.errorSummary.style.display = "block";
      this.errorSummary.querySelector("h3").focus();
    } else {
      this.errorSummary.style.display = "none";
    }
  }

  _isValid(elemento) {
    let validacao;
    if (elemento.required) {
      switch (elemento.type) {
        case "checkbox":
          validacao = this._isValidCheckbox(elemento);
          break;
        case "radio":
          validacao = this._isValidRadio(elemento);
          break;
        case "select-one":
        case "select-multiple":
          validacao = this._isValidSelect(elemento);
          break;
        default:
          validacao = this._isValidInput(elemento);
      }
    } else {
      validacao = { isValid: true, erroMsg: "" };
    }

    if (!validacao.isValid) {
      this._exibirErro(elemento.id, validacao.erroMsg);
    } else {
      this._limparErro(elemento.id);
    }
    return validacao;
  }

  _isValidCheckbox(checkbox) {
    return {
      isValid: checkbox.checked,
      erroMsg: "Este campo é obrigatório.",
      type: "checkbox",
    };
  }

  _isValidRadio(radio) {
    const isValid = Array.from(document.getElementsByName(radio.name)).some(
      (r) => r.checked
    );
    return {
      isValid: isValid,
      erroMsg: "Por favor, selecione uma opção.",
      type: "radio",
    };
  }

  _isValidSelect(select) {
    return {
      isValid: select.value.trim() !== "",
      erroMsg: "Por favor, selecione uma opção.",
      type: "select",
    };
  }

  _isValidInput(input) {
    let isValid = true;
    let erroMsg = "";
    let type = "input";

    if (input.value.trim() === "") {
      isValid = false;
      erroMsg = "Por favor, preencha este campo.";
    } else if (input.type === "email" && !this._isValidEmail(input.value)) {
      isValid = false;
      erroMsg = "Por favor, insira um e-mail válido.";
    }

    return { isValid, erroMsg, type };
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _limparErro(id) {
    const elemento = document.getElementById(id);
    const erroElemento = document.getElementById("erro" + id);
    if (erroElemento) {
      erroElemento.style.display = "none";
      erroElemento.textContent = "";
      elemento.setAttribute("aria-invalid", "false");
    }
  }

  _exibirErro(id, mensagem) {
    const elemento = document.getElementById(id);
    const erroElemento = document.getElementById("erro" + id);
    if (erroElemento) {
      erroElemento.style.display = "block";
      erroElemento.textContent = mensagem;
      elemento.setAttribute("aria-invalid", "true");
    }
  }
}

const meuFormValidator = new FormValidator("formulario");
