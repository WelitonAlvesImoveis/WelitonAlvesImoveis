import mongoose from "mongoose";
import Property from "../models/Property.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";

// Público (landing): lista 
export const listPublicProperties = async (req, res, next) => {
  try {
    const items = await Property.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getPublicPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await Property.findOne({ _id: id, isActive: true });

    if (!item) {
      return res.status(404).json({ message: "Imóvel não encontrado" });
    }

    return res.json(item);
  } catch (error) {
    next(error);
  }
};

// Privado (admin): lista todos
export const listAllProperties = async (req, res, next) => {
  try {
    const items = await Property.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    next(error);
  }
};

// Privado (admin): criar
export const createProperty = async (req, res, next) => {
  try {

    const {
      title,
      description,
      price,
      city,
      state,
      neighborhood,
      address,
      videoUrl,
      isActive,
    } = req.body || {};

    if (!title || !description || price === undefined || !city || !state) {
      return res.status(400).json({
        message: "Título, descrição, preço, cidade e estado são obrigatórios",
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({
        message: "O título deve ter pelo menos 5 caracteres",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        message: "A descrição deve ter pelo menos 10 caracteres",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "O preço não pode ser negativo",
      });
    }

    if (state.trim().toUpperCase() !== "ES") {
      return res.status(400).json({
        message: "Apenas imóveis no estado do ES são permitidos",
      });
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "property-manager",
        );

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const property = await Property.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      neighborhood: neighborhood?.trim() || "",
      address: address?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      images: uploadedImages,
      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,
    });

    return res.status(201).json({
      message: "Imóvel cadastrado com sucesso",
      property,
    });
  } catch (error) {
    next(error);
  }
};

// Privado (admin): atualizar
export const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const {
      title,
      description,
      price,
      city,
      state,
      neighborhood,
      address,
      videoUrl,
      isActive,
      replaceMainImage,
    } = req.body || {};

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Imóvel não encontrado" });
    }

    if (title !== undefined) {
      if (title.trim().length < 5) {
        return res.status(400).json({
          message: "O título deve ter pelo menos 5 caracteres",
        });
      }
      property.title = title.trim();
    }

    if (description !== undefined) {
      if (description.trim().length < 10) {
        return res.status(400).json({
          message: "A descrição deve ter pelo menos 10 caracteres",
        });
      }
      property.description = description.trim();
    }

    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          message: "O preço não pode ser negativo",
        });
      }
      property.price = Number(price);
    }

    if (city !== undefined) {
      property.city = city.trim();
    }

    if (state !== undefined) {
      if (state.trim().toUpperCase() !== "ES") {
        return res.status(400).json({
          message: "Apenas imóveis no estado do ES são permitidos",
        });
      }
      property.state = state.trim().toUpperCase();
    }

    if (neighborhood !== undefined) {
      property.neighborhood = neighborhood.trim();
    }

    if (address !== undefined) {
      property.address = address.trim();
    }

    if (videoUrl !== undefined) {
      property.videoUrl = videoUrl.trim();
    }

    if (isActive !== undefined) {
      property.isActive = isActive === "true" || isActive === true;
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "property-manager",
        );

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      if (replaceMainImage === "true") {
        property.images = [
          ...uploadedImages,
          ...(property.images?.slice(1) || []),
        ];
      } else {
        property.images = [...(property.images || []), ...uploadedImages];
      }
    }

    await property.save();

    return res.json({
      message: "Imóvel atualizado com sucesso",
      property,
    });
  } catch (error) {
    next(error);
  }
};

// Privado (admin): deletar (Apenas imagem individual)
export const deletePropertyImage = async (req, res, next) => {
  try {
    const { id, publicId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Imóvel não encontrado" });
    }

    const decodedPublicId = decodeURIComponent(publicId);

    const imageExists = property.images.some(
      (image) => image.publicId === decodedPublicId,
    );

    if (!imageExists) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }

    await deleteFromCloudinary(decodedPublicId);

    property.images = property.images.filter(
      (image) => image.publicId !== decodedPublicId,
    );

    await property.save();

    return res.json({
      message: "Imagem removida com sucesso",
      images: property.images,
    });
  } catch (error) {
    next(error);
  }
};

// Privado (admin): deletar (HARD DELETE)
export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Imóvel não encontrado" });
    }

    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    await Property.findByIdAndDelete(id);

    return res.json({
      message: "Imóvel removido permanentemente",
    });
  } catch (error) {
    next(error);
  }
};
