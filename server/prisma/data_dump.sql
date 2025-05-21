--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Permission" (id, key, description) VALUES (1, 'site', '');
INSERT INTO public."Permission" (id, key, description) VALUES (2, 'vendor', '');
INSERT INTO public."Permission" (id, key, description) VALUES (3, 'client', '');
INSERT INTO public."Permission" (id, key, description) VALUES (4, 'order', '');
INSERT INTO public."Permission" (id, key, description) VALUES (5, '_create_site', '');
INSERT INTO public."Permission" (id, key, description) VALUES (6, '_update_site', '');
INSERT INTO public."Permission" (id, key, description) VALUES (7, '_delete_site', '');
INSERT INTO public."Permission" (id, key, description) VALUES (8, '_create_vendor', '');
INSERT INTO public."Permission" (id, key, description) VALUES (9, '_update_vendor', '');
INSERT INTO public."Permission" (id, key, description) VALUES (10, '_delete_vendor', '');
INSERT INTO public."Permission" (id, key, description) VALUES (11, '_create_client', '');
INSERT INTO public."Permission" (id, key, description) VALUES (12, '_update_client', '');
INSERT INTO public."Permission" (id, key, description) VALUES (13, '_delete_client', '');
INSERT INTO public."Permission" (id, key, description) VALUES (14, '_create_order', '');
INSERT INTO public."Permission" (id, key, description) VALUES (15, '_update_order', '');
INSERT INTO public."Permission" (id, key, description) VALUES (16, '_delete_order', '');
INSERT INTO public."Permission" (id, key, description) VALUES (17, '_tools', '');
INSERT INTO public."Permission" (id, key, description) VALUES (18, '_tools_1', '');
INSERT INTO public."Permission" (id, key, description) VALUES (19, '_tools_2', '');
INSERT INTO public."Permission" (id, key, description) VALUES (20, '_tools_3', '');
INSERT INTO public."Permission" (id, key, description) VALUES (21, '_tools_4', '');
INSERT INTO public."Permission" (id, key, description) VALUES (22, 'dashboard', '');
INSERT INTO public."Permission" (id, key, description) VALUES (23, 'Tools', '');
INSERT INTO public."Permission" (id, key, description) VALUES (24, '_tools_5', '');
INSERT INTO public."Permission" (id, key, description) VALUES (25, '_tools_6', '');
INSERT INTO public."Permission" (id, key, description) VALUES (26, '_tools_7', '');
INSERT INTO public."Permission" (id, key, description) VALUES (31, '_tools_8', '');
INSERT INTO public."Permission" (id, key, description) VALUES (33, '_tools_9', '');


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Resource" (id, key, description) VALUES (1, 'Site.id', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (2, 'Site.website', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (3, 'Site.niche', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (4, 'Site.contentCategories', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (5, 'Site.siteClassification', 'Enum(SiteClassification)');
INSERT INTO public."Resource" (id, key, description) VALUES (6, 'Site.priceCategory', 'Enum(PriceCategory)?');
INSERT INTO public."Resource" (id, key, description) VALUES (7, 'Site.domainAuthority', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (8, 'Site.pageAuthority', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (9, 'Site.linkAttribute', 'Enum(linkAttribute)?');
INSERT INTO public."Resource" (id, key, description) VALUES (10, 'Site.ahrefTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (11, 'Site.spamScore', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (12, 'Site.domainRating', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (13, 'Site.socialMediaPosting', 'Boolean?');
INSERT INTO public."Resource" (id, key, description) VALUES (14, 'Site.costPrice', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (16, 'Site.discount', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (17, 'Site.adultPrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (18, 'Site.casinoAdultPrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (19, 'Site.cbdPrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (20, 'Site.linkInsertionCost', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (21, 'Site.websiteRemark', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (22, 'Site.webIP', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (23, 'Site.webCountry', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (24, 'Site.turnAroundTime', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (25, 'Site.semrushTraffic', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (26, 'Site.semrushFirstCountryName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (27, 'Site.semrushSecondCountryName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (28, 'Site.semrushFirstCountryTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (29, 'Site.semrushSecondCountryTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (30, 'Site.semrushThirdCountryName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (31, 'Site.semrushThirdCountryTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (32, 'Site.semrushFourthCountryName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (33, 'Site.semrushFourthCountryTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (34, 'Site.semrushFifthCountryName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (35, 'Site.semrushFifthCountryTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (36, 'Site.similarwebTraffic', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (38, 'Site.websiteType', 'Enum(WebsiteType)?');
INSERT INTO public."Resource" (id, key, description) VALUES (39, 'Site.language', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (40, 'Site.disclaimer', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (41, 'Site.anchorText', 'Boolean?');
INSERT INTO public."Resource" (id, key, description) VALUES (42, 'Site.bannerImagePrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (43, 'Site.costPriceUpdateDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (44, 'Site.pureCategory', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (45, 'Site.availability', 'Boolean?');
INSERT INTO public."Resource" (id, key, description) VALUES (46, 'Site.isIndexed', 'Boolean?');
INSERT INTO public."Resource" (id, key, description) VALUES (47, 'Site.websiteStatus', 'Enum(WebsiteStatus)');
INSERT INTO public."Resource" (id, key, description) VALUES (48, 'Site.websiteQuality', 'Enum(WebsiteQuality)?');
INSERT INTO public."Resource" (id, key, description) VALUES (49, 'Site.numberOfLinks', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (50, 'Site.semrushUpdateDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (51, 'Site.semrushOrganicTraffic', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (52, 'Site.semrushOrganicTrafficLastUpdated', 'DateTime');
INSERT INTO public."Resource" (id, key, description) VALUES (53, 'Site.createdAt', 'DateTime');
INSERT INTO public."Resource" (id, key, description) VALUES (54, 'Site.updatedAt', 'DateTime');
INSERT INTO public."Resource" (id, key, description) VALUES (55, 'Site.vendorId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (56, 'Site.pocId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (57, 'Vendor.id', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (58, 'Vendor.name', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (59, 'Vendor.phone', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (60, 'Vendor.email', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (61, 'Vendor.pitchedFrom', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (62, 'Vendor.bankName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (63, 'Vendor.accountNumber', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (64, 'Vendor.ifscCode', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (65, 'Vendor.paypalId', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (66, 'Vendor.skypeId', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (67, 'Vendor.upiId', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (68, 'Vendor.category', 'Enum(VendorCategory)?');
INSERT INTO public."Resource" (id, key, description) VALUES (69, 'Vendor.createdAt', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (70, 'Vendor.updatedAt', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (71, 'Vendor.pocId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (72, 'Client.id', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (73, 'Client.name', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (74, 'Client.phone', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (76, 'Client.fbId', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (77, 'Client.contactedFrom', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (78, 'Client.website', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (79, 'Client.source', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (80, 'Client.clientClientName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (81, 'Client.projects', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (82, 'Client.createdAt', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (83, 'Client.updatedAt', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (84, 'Client.pocId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (85, 'Order.id', 'Int');
INSERT INTO public."Resource" (id, key, description) VALUES (86, 'Order.orderDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (87, 'Order.orderStatus', 'Enum(OrderStatus)');
INSERT INTO public."Resource" (id, key, description) VALUES (88, 'Order.vendorAssignedDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (89, 'Order.orderStatusUpdateDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (90, 'Order.publishDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (91, 'Order.publishURL', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (92, 'Order.orderRemark', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (93, 'Order.mainRemark', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (94, 'Order.clientPaymentRemark', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (95, 'Order.clientContentCost', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (96, 'Order.clientProposedAmount', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (97, 'Order.clientPaymentStatus', 'Enum(ClientPaymentStatus)?');
INSERT INTO public."Resource" (id, key, description) VALUES (98, 'Order.clientReceivedAmount', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (99, 'Order.clientPaymentDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (100, 'Order.vendorInvoiceStatus', 'Enum(VendorInvoiceStatus)?');
INSERT INTO public."Resource" (id, key, description) VALUES (101, 'Order.vendorPaymentStatus', 'Enum(VendorPaymentStatus)?');
INSERT INTO public."Resource" (id, key, description) VALUES (102, 'Order.vendorPaymentDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (103, 'Order.vendorPaymentAmount', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (104, 'Order.invoiceNumber', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (105, 'Order.costPriceWithGST', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (106, 'Order.indexedScreenShotLink', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (107, 'Order.siteId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (108, 'Order.salesPersonId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (109, 'Order.clientId', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (110, 'Order.createdAt', 'DateTime');
INSERT INTO public."Resource" (id, key, description) VALUES (111, 'Order.updatedAt', 'DateTime');
INSERT INTO public."Resource" (id, key, description) VALUES (114, 'Poc.name', '');
INSERT INTO public."Resource" (id, key, description) VALUES (115, 'Order.orderNumber', '');
INSERT INTO public."Resource" (id, key, description) VALUES (116, 'Site.categories', '');
INSERT INTO public."Resource" (id, key, description) VALUES (117, 'Site.costPriceValidFrom', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (118, 'Site.costPriceValidTo', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (37, 'Site.domainAuthorityUpdateDate', 'DateTime?');
INSERT INTO public."Resource" (id, key, description) VALUES (119, 'Site.sampleURL', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (120, 'Order.orderCostPrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (15, 'Site.sellingPrice', 'Int?');
INSERT INTO public."Resource" (id, key, description) VALUES (121, 'Client.companyName', 'String?');
INSERT INTO public."Resource" (id, key, description) VALUES (75, 'Client.email', 'String');
INSERT INTO public."Resource" (id, key, description) VALUES (150, 'SalesPerson.name', '');


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Role" (id, name) VALUES (1, 'Sales');
INSERT INTO public."Role" (id, name) VALUES (2, 'Admin');
INSERT INTO public."Role" (id, name) VALUES (3, 'Manager');
INSERT INTO public."Role" (id, name) VALUES (4, 'Operator');


--
-- PostgreSQL database dump complete
--

