import * as salesService from "../services/sales.service.js";

export const getSalesData = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sort = "date:desc",
      region,
      gender,
      category,
      tags,
      paymentMethod,
      ageMin,
      ageMax,
      dateMin,
      dateMax,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(sizeNum) || sizeNum < 1) {
      return res.status(400).send({
        message:
          "Invalid pagination parameters. Page and pageSize must be positive integers.",
      });
    }

    const minAge = ageMin ? parseInt(ageMin, 10) : null;
    const maxAge = ageMax ? parseInt(ageMax, 10) : null;

    if (
      (minAge !== null && isNaN(minAge)) ||
      (maxAge !== null && isNaN(maxAge))
    ) {
      return res
        .status(400)
        .send({ message: "Invalid age range. Age values must be numeric." });
    }
    if (minAge !== null && maxAge !== null && minAge > maxAge) {
      return res.status(400).send({
        message:
          "Invalid age range: Minimum age cannot be greater than maximum age.",
      });
    }
    const filters = {
      region: region ? region.split(",") : null,
      gender: gender ? gender.split(",") : null,
      category: category ? category.split(",") : null,
      tags: tags ? tags.split(",") : null,
      paymentMethod: paymentMethod ? paymentMethod.split(",") : null,

      age: minAge || maxAge ? { min: minAge, max: maxAge } : null,
      date: dateMin || dateMax ? { min: dateMin, max: dateMax } : null,
    };

    const queryParams = {
      page: pageNum,
      pageSize: sizeNum,
      search: String(search).toLowerCase(),
      sort,
      filters,
    };

    const { data, totalCount, totalFinalAmount, totalDiscount } =
      await salesService.fetchSalesData(queryParams);

    if (totalCount === 0 && (search || Object.keys(filters).length > 0)) {
      console.log("No results found for current criteria.");
    }

    return res.status(200).send({
      data,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / sizeNum),
      totalFinalAmount,
      totalDiscount,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return res.status(500).send({
      message: "Internal Server Error while processing sales query.",
      details: error.message,
    });
  }
};
