import mongoose from "mongoose";

const logConnectionError = (error, label = "Erro ao conectar no MongoDB") => {
  console.error(label + ":", error.message);
  console.error("Detalhes do erro:", {
    code: error.code,
    syscall: error.syscall,
    hostname: error.hostname,
  });
};

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return;
  } catch (error) {
    logConnectionError(error);

    const isSrvResolutionError =
      process.env.MONGO_URI?.startsWith("mongodb+srv://") && error.syscall === "querySrv";

    if (!isSrvResolutionError) {
      process.exit(1);
    }

    const fallbackUri = process.env.MONGO_URI_NO_SRV;
    if (!fallbackUri) {
      console.error(
        "Falha ao resolver o registro SRV do Atlas e nenhuma MONGO_URI_NO_SRV foi definida no .env. " +
          "Pegue a connection string sem SRV em Atlas > Database > Connect > Drivers, selecione a opção " +
          "de driver/versão que gera a string 'mongodb://' (sem '+srv', com os hosts explícitos) e defina-a " +
          "em MONGO_URI_NO_SRV no .env."
      );
      process.exit(1);
    }

    console.warn(
      "Falha ao resolver o registro SRV do Atlas (_mongodb._tcp). Usando MONGO_URI_NO_SRV, " +
        "que não depende de nenhuma resolução SRV..."
    );

    try {
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB conectado via MONGO_URI_NO_SRV: ${conn.connection.host}`);
    } catch (fallbackError) {
      logConnectionError(fallbackError, "Erro ao conectar no MongoDB via MONGO_URI_NO_SRV");
      process.exit(1);
    }
  }
};

export default connectDatabase;
