import { Op } from "sequelize";
import { Sale } from "../models/sale.js";
import db from "../config/db.config.js";

const buildWhereClause = (queryParams) => {
  const { search, filters } = queryParams;
  const whereConditions = [];

  if (search) {
    const searchCondition = {
      [Op.or]: [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { phoneNumber: { [Op.iLike]: `%${search}%` } },
      ],
    };
    whereConditions.push(searchCondition);
  }

  const multiSelectFields = ["region", "gender", "category", "paymentMethod"];

  multiSelectFields.forEach((field) => {
    const attributeName =
      field === "region"
        ? "customerRegion"
        : field === "category"
        ? "productCategory"
        : field;

    if (filters[field] && filters[field].length > 0) {
      whereConditions.push({
        [attributeName]: {
          [Op.in]: filters[field],
        },
      });
    }
  });

  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map((tag) => ({
      tags: {
        [Op.iLike]: `%${tag}%`,
      },
    }));
    whereConditions.push({
      [Op.or]: tagConditions,
    });
  }

  const { age } = filters;
  if (age && (age.min !== null || age.max !== null)) {
    let ageCondition = {};
    if (age.min !== null) {
      ageCondition[Op.gte] = age.min;
    }
    if (age.max !== null) {
      ageCondition[Op.lte] = age.max;
    }
    whereConditions.push({ age: ageCondition });
  }

  const { date } = filters;
  if (date && (date.min || date.max)) {
    let dateCondition = {};
    if (date.min) {
      dateCondition[Op.gte] = new Date(date.min);
    }
    if (date.max) {
      let maxDate = new Date(date.max);
      maxDate.setDate(maxDate.getDate() + 1);
      dateCondition[Op.lt] = maxDate;
    }
    whereConditions.push({ date: dateCondition });
  }

  return whereConditions;
};

export const fetchSalesData = async (queryParams) => {
  const { page, pageSize, sort } = queryParams;

  const where = {
    [Op.and]: buildWhereClause(queryParams),
  };

  const [sortField, sortDirection] = sort.split(":");

  let orderByField = sortField;
  if (sortField === "customerName") {
    orderByField = "customerName";
  } else if (sortField === "finalAmount") {
    orderByField = "finalAmount";
  } else if (sortField === "date") {
    orderByField = "date";
  }

  const order = [[orderByField, sortDirection.toUpperCase() || "ASC"]];

  const offset = (page - 1) * pageSize;

  const result = await Sale.findAndCountAll({
    where,
    order,
    limit: pageSize,
    offset: offset,
  });

  const aggregates = await Sale.findAll({
    where,
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("finalAmount")),
        "totalFinalAmount",
      ],
      [db.sequelize.fn("SUM", db.sequelize.col("totalAmount")), "totalAmount"],
    ],
    raw: true,
  });

  const totalFinalAmount = parseFloat(aggregates[0]?.totalFinalAmount || 0);
  const totalAmount = parseFloat(aggregates[0]?.totalAmount || 0);
  const totalDiscount = totalAmount - totalFinalAmount;

  return {
    data: result.rows,
    totalCount: result.count,
    totalFinalAmount,
    totalDiscount,
  };
};
