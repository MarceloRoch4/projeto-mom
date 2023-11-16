### Passos para execução do projeto MOM. (Linux apenas)

1. Para executar o projeto, será necessário rodar o RabbitMQ.
   https://www.rabbitmq.com/download.html

    Para este projeto o rabbitmq deverá estar rodando localmente na porta `15672`.
    O usuario e senha que a aplicação irá tentar autenticar são:

        usuario: guest 
        senha: guest
    - obs.: Essas sao as credenciais padrões

    Se você tem docker instalado na maquina basta rodar o comando:
    ```bash
    >> docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management
    ```
   Neste momento RabbitMQ deve estar rodando em `localhost:15672`. Para testar basta acessar no navegador e autenticar com as credenciais padrões.


2. Entre na pasta `executaveis`.

3. Em um console, rode o gerenciador MOM:
```bash
>> ./gerenciador.AppImage
```

4. Em outros consoles, rode quantas instâncias do cliente achar necessário:
```bash
>> ./cliente.AppImage
```

#### Se quiser instalar localmente, basta usar o [PNPM](https://pnpm.io/pt/) em seus respectivos diretórios. (Qualquer plataforma)

1. Tanto no gerenciador como no cliente o comando é o mesmo:
```bash
>> pnpm install & pnpm start
```
