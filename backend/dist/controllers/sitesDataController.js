"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitesDataController = sitesDataController;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
// Helper function to serialize BigInt values
function serialize(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value));
}
function sitesDataController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const queryParams = req.query;
            // Pagination defaults
            const page = queryParams.page ? parseInt(queryParams.page) : 1;
            const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;
            const skip = (page - 1) * pageSize;
            const take = pageSize;
            // Sorting defaults
            const allowedSortFields = [
                'id', 'da', 'pa', 'price', 'traffic', 'spam_score', 'dr',
                'organic_traffic', 'num_of_links', 'banner_image_price',
                'created_at', 'cp_update_date', 'semrush_updation_date'
            ];
            const sortBy = queryParams.sortBy && allowedSortFields.includes(queryParams.sortBy) ? queryParams.sortBy : 'id';
            const sortOrder = queryParams.sortOrder === 'desc' ? 'desc' : 'asc';
            // Building the 'where' clause for filters
            const where = {};
            // Numeric Filters
            const numericFilters = [
                { paramMin: 'daMin', paramMax: 'daMax', field: 'da' },
                { paramMin: 'paMin', paramMax: 'paMax', field: 'pa' },
                { paramMin: 'priceMin', paramMax: 'priceMax', field: 'price' },
                { paramMin: 'trafficMin', paramMax: 'trafficMax', field: 'traffic' },
                { paramMin: 'spamScoreMin', paramMax: 'spamScoreMax', field: 'spam_score' },
                { paramMin: 'drMin', paramMax: 'drMax', field: 'dr' },
                { paramMin: 'organicTrafficMin', paramMax: 'organicTrafficMax', field: 'organic_traffic' },
                { paramMin: 'numOfLinksMin', paramMax: 'numOfLinksMax', field: 'num_of_links' },
                { paramMin: 'bannerImagePriceMin', paramMax: 'bannerImagePriceMax', field: 'banner_image_price' },
            ];
            numericFilters.forEach(filter => {
                const min = queryParams[filter.paramMin];
                const max = queryParams[filter.paramMax];
                if (min || max) {
                    where[filter.field] = {};
                    if (min)
                        where[filter.field].gte = parseInt(min);
                    if (max)
                        where[filter.field].lte = parseInt(max);
                }
            });
            // Enum Filters
            const enumFilters = [
                { param: 'follow', field: 'follow' },
                { param: 'price_category', field: 'price_category' },
                { param: 'vendor_invoice_status', field: 'vendor_invoice_status' },
                { param: 'website_type', field: 'website_type' },
                { param: 'website_status', field: 'website_status' },
                { param: 'website_quality', field: 'website_quality' },
            ];
            enumFilters.forEach(filter => {
                const value = queryParams[filter.param];
                if (value) {
                    where[filter.field] = {
                        in: Array.isArray(value) ? value : [value],
                    };
                }
            });
            // Text Filters with Limited Distinct Values
            const textFilters = [
                { param: 'niche', field: 'niche' },
                { param: 'site_category', field: 'site_category' },
                { param: 'language', field: 'language' },
                { param: 'vendor_country', field: 'vendor_country' },
                { param: 'web_country', field: 'web_country' },
            ];
            textFilters.forEach(filter => {
                const value = queryParams[filter.param];
                if (value) {
                    where[filter.field] = {
                        in: Array.isArray(value) ? value : [value],
                        mode: 'insensitive',
                    };
                }
            });
            // Boolean/Binary Filters
            const booleanFilters = [
                { param: 'adult', field: 'adult' },
                { param: 'casino_adult', field: 'casino_adult' },
                { param: 'social_media_posting', field: 'social_media_posting' },
            ];
            booleanFilters.forEach(filter => {
                const value = queryParams[filter.param];
                if (value !== undefined) {
                    where[filter.field] = value === 'true' ? 1 : 0;
                }
            });
            // Date Filters
            const dateFilters = [
                { paramStart: 'createdAtStart', paramEnd: 'createdAtEnd', field: 'created_at' },
                { paramStart: 'cpUpdateDateStart', paramEnd: 'cpUpdateDateEnd', field: 'cp_update_date' },
                { paramStart: 'semrushUpdationDateStart', paramEnd: 'semrushUpdationDateEnd', field: 'semrush_updation_date' },
            ];
            dateFilters.forEach(filter => {
                const start = queryParams[filter.paramStart];
                const end = queryParams[filter.paramEnd];
                if (start || end) {
                    where[filter.field] = {};
                    if (start)
                        where[filter.field].gte = new Date(start);
                    if (end)
                        where[filter.field].lte = new Date(end);
                }
            });
            // High Cardinality Text Filters
            if (queryParams.website) {
                where.website = {
                    contains: queryParams.website,
                    mode: 'insensitive',
                };
            }
            if (queryParams.person) {
                where.person = {
                    contains: queryParams.person,
                    mode: 'insensitive',
                };
            }
            // Build the 'orderBy' clause
            const orderBy = {
                [sortBy]: sortOrder,
            };
            // Get total number of records matching the filters
            const totalRecords = yield prismaClient_1.default.site.count({ where });
            // Fetch data with pagination, filtering, and sorting
            const data = yield prismaClient_1.default.site.findMany({
                where,
                orderBy,
                skip,
                take,
            });
            // Serialize data to handle BigInt values
            const serializedData = serialize(data);
            // Prepare the response
            const response = {
                success: true,
                data: serializedData,
                totalRecords,
                page,
                pageSize,
            };
            return res.status(200).json(response);
        }
        catch (error) {
            console.error('Error fetching sites data:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
}
