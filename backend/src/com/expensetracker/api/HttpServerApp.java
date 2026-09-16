package com.expensetracker.api;

import com.expensetracker.dao.*;
import com.expensetracker.dao.impl.*;
import com.expensetracker.model.*;
import com.expensetracker.service.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.util.*;

public class HttpServerApp {

    private static final int PORT = 8080;
    private static final AuthService authService = new AuthService();
    private static final OnboardingService onboardingService = new OnboardingService();
    private static final ExpenseService expenseService = new ExpenseService();
    private static final DashboardService dashboardService = new DashboardService();
    private static final UserDAO userDAO = new UserDAOImpl();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Register API Context Handlers
        server.createContext("/api/auth/signup", new SignupHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/onboarding", new OnboardingHandler());
        server.createContext("/api/expenses", new ExpensesHandler());
        server.createContext("/api/dashboard/summary", new DashboardSummaryHandler());
        server.createContext("/api/dashboard/categories", new DashboardCategoriesHandler());
        server.createContext("/api/dashboard/insights", new DashboardInsightsHandler());
        server.createContext("/api/dashboard/what-if", new WhatIfHandler());
        server.createContext("/api/user/profile", new UserProfileHandler());

        server.setExecutor(null);
        System.out.println("====================================================");
        System.out.println(" Core Java HTTP API Server running on port " + PORT);
        System.out.println(" Ready for Next.js frontend communication.");
        System.out.println("====================================================");
        server.start();
    }

    // CORS & Response Utility
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length > 1) {
                map.put(pair[0], pair[1]);
            } else if (pair.length == 1) {
                map.put(pair[0], "");
            }
        }
        return map;
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            return builder.toString();
        }
    }

    // JSON Helper methods for request parsing
    private static String getJsonString(String json, String key) {
        if (json == null) return "";
        String pattern = "\"" + key + "\":";
        int idx = json.indexOf(pattern);
        if (idx == -1) {
            pattern = "\"" + key + "\" :";
            idx = json.indexOf(pattern);
        }
        if (idx == -1) return "";
        int start = idx + pattern.length();
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '\t')) {
            start++;
        }
        if (start < json.length() && json.charAt(start) == '"') {
            start++;
            int end = json.indexOf('"', start);
            if (end != -1) return json.substring(start, end);
        } else {
            int end = start;
            while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}' && json.charAt(end) != '\n' && json.charAt(end) != '\r') {
                end++;
            }
            return json.substring(start, end).trim();
        }
        return "";
    }

    private static int getJsonInt(String json, String key, int defaultValue) {
        String val = getJsonString(json, key);
        try {
            return Integer.parseInt(val);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private static BigDecimal getJsonBigDecimal(String json, String key, BigDecimal defaultValue) {
        String val = getJsonString(json, key);
        try {
            return new BigDecimal(val);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private static Map<String, BigDecimal> getJsonCategories(String json) {
        Map<String, BigDecimal> map = new HashMap<>();
        if (json == null) return map;
        int idx = json.indexOf("\"categories\"");
        if (idx == -1) return map;
        int start = json.indexOf('{', idx);
        if (start == -1) return map;
        int end = json.indexOf('}', start);
        if (end == -1) return map;
        String inner = json.substring(start + 1, end);
        String[] pairs = inner.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":");
            if (kv.length == 2) {
                String cat = kv[0].trim().replace("\"", "");
                String amtStr = kv[1].trim().replace("\"", "");
                try {
                    map.put(cat, new BigDecimal(amtStr));
                } catch (Exception ignored) {}
            }
        }
        return map;
    }

    // 1. Signup Handler
    static class SignupHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String name = getJsonString(body, "name");
            String email = getJsonString(body, "email");
            String password = getJsonString(body, "password");

            AuthResult result = authService.signup(name, email, password);
            String userJson = result.getUser() != null 
                ? String.format("{\"userId\":%d,\"name\":\"%s\",\"email\":\"%s\"}", result.getUser().getUserId(), result.getUser().getName().replace("\"", "\\\""), result.getUser().getEmail()) 
                : "null";
            String json = String.format("{\"success\":%b,\"message\":\"%s\",\"user\":%s}", result.isSuccess(), result.getMessage().replace("\"", "\\\""), userJson);
            sendJsonResponse(exchange, result.isSuccess() ? 200 : 400, json);
        }
    }

    // 2. Login Handler
    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String email = getJsonString(body, "email");
            String password = getJsonString(body, "password");

            AuthResult result = authService.login(email, password);
            String userJson = result.getUser() != null 
                ? String.format("{\"userId\":%d,\"name\":\"%s\",\"email\":\"%s\"}", result.getUser().getUserId(), result.getUser().getName().replace("\"", "\\\""), result.getUser().getEmail()) 
                : "null";
            String json = String.format("{\"success\":%b,\"message\":\"%s\",\"user\":%s}", result.isSuccess(), result.getMessage().replace("\"", "\\\""), userJson);
            sendJsonResponse(exchange, result.isSuccess() ? 200 : 401, json);
        }
    }

    // 3. Onboarding Handler
    static class OnboardingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            int userId = getJsonInt(body, "userId", 1);
            BigDecimal income = getJsonBigDecimal(body, "income", new BigDecimal("0"));
            BigDecimal savingsTarget = getJsonBigDecimal(body, "savingsTarget", new BigDecimal("0"));
            Map<String, BigDecimal> categories = getJsonCategories(body);

            boolean ok = onboardingService.saveOnboardingProfile(userId, income, savingsTarget, categories);
            sendJsonResponse(exchange, ok ? 200 : 400, String.format("{\"success\":%b,\"message\":\"Onboarding profile saved\"}", ok));
        }
    }

    // 4. Expenses CRUD Handler
    static class ExpensesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            String method = exchange.getRequestMethod();
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int userId = Integer.parseInt(params.getOrDefault("userId", "1"));

            if ("GET".equalsIgnoreCase(method)) {
                List<Expense> list = expenseService.getUserExpenses(userId);
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Expense e = list.get(i);
                    sb.append(String.format("{\"expenseId\":%d,\"userId\":%d,\"title\":\"%s\",\"categoryName\":\"%s\",\"amount\":%s,\"expenseDate\":\"%s\"}", e.getExpenseId(), e.getUserId(), e.getTitle().replace("\"", "\\\""), e.getCategoryName().replace("\"", "\\\""), e.getAmount(), e.getExpenseDate()));
                    if (i < list.size() - 1) sb.append(",");
                }
                sb.append("]");
                sendJsonResponse(exchange, 200, sb.toString());
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                int reqUserId = getJsonInt(body, "userId", userId);
                String title = getJsonString(body, "title");
                if (title.isEmpty()) title = "Expense";
                String categoryName = getJsonString(body, "categoryName");
                if (categoryName.isEmpty()) categoryName = "General";
                BigDecimal amount = getJsonBigDecimal(body, "amount", new BigDecimal("0"));
                String dateStr = getJsonString(body, "expenseDate");
                Date date;
                try {
                    date = dateStr.isEmpty() ? new Date(System.currentTimeMillis()) : Date.valueOf(dateStr);
                } catch (Exception ex) {
                    date = new Date(System.currentTimeMillis());
                }
                String notes = getJsonString(body, "notes");

                boolean ok = expenseService.addExpense(reqUserId, title, categoryName, amount, date, notes);
                sendJsonResponse(exchange, ok ? 201 : 400, String.format("{\"success\":%b,\"message\":\"Expense recorded\"}", ok));
            } else if ("PUT".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                int expenseId = getJsonInt(body, "expenseId", 0);
                int reqUserId = getJsonInt(body, "userId", userId);
                String title = getJsonString(body, "title");
                if (title.isEmpty()) title = "Expense";
                String categoryName = getJsonString(body, "categoryName");
                if (categoryName.isEmpty()) categoryName = "General";
                BigDecimal amount = getJsonBigDecimal(body, "amount", new BigDecimal("0"));
                String dateStr = getJsonString(body, "expenseDate");
                Date date;
                try {
                    date = dateStr.isEmpty() ? new Date(System.currentTimeMillis()) : Date.valueOf(dateStr);
                } catch (Exception ex) {
                    date = new Date(System.currentTimeMillis());
                }
                String notes = getJsonString(body, "notes");
                Expense exp = new Expense(reqUserId, title, categoryName, amount, date, notes);
                exp.setExpenseId(expenseId);
                boolean ok = expenseService.updateExpense(exp);
                sendJsonResponse(exchange, ok ? 200 : 400, String.format("{\"success\":%b,\"message\":\"%s\"}", ok, ok ? "Expense updated" : "Failed to update expense"));
            } else if ("DELETE".equalsIgnoreCase(method)) {
                int id = Integer.parseInt(params.getOrDefault("id", "0"));
                boolean ok = expenseService.deleteExpense(id, userId);
                sendJsonResponse(exchange, ok ? 200 : 400, String.format("{\"success\":%b,\"message\":\"Expense deleted\"}", ok));
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
            }
        }
    }

    // 5. Dashboard Summary Handler
    static class DashboardSummaryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int userId = Integer.parseInt(params.getOrDefault("userId", "1"));

            DashboardSummary summary = dashboardService.getDashboardSummary(userId);
            
            // Build JSON output
            StringBuilder sb = new StringBuilder("{");
            sb.append(String.format("\"totalIncome\":%s,", summary.getTotalIncome()));
            sb.append(String.format("\"totalExpenses\":%s,", summary.getTotalExpenses()));
            sb.append(String.format("\"remainingBalance\":%s,", summary.getRemainingBalance()));
            sb.append(String.format("\"savingsTarget\":%s,", summary.getSavingsTarget()));
            sb.append(String.format("\"savingsProgressPercentage\":%s,", summary.getSavingsProgressPercentage()));
            
            // Timeline calculation based on timeframe parameter
            String timeframe = params.getOrDefault("timeframe", "1M").toUpperCase();
            List<Expense> allExpenses = expenseService.getUserExpenses(userId);
            long nowMs = System.currentTimeMillis();
            long cutoffMs = 0;
            switch (timeframe) {
                case "1D": cutoffMs = nowMs - (1L * 24 * 3600 * 1000); break;
                case "1W": cutoffMs = nowMs - (7L * 24 * 3600 * 1000); break;
                case "1M": cutoffMs = nowMs - (30L * 24 * 3600 * 1000); break;
                case "3M": cutoffMs = nowMs - (90L * 24 * 3600 * 1000); break;
                case "1Y": cutoffMs = nowMs - (365L * 24 * 3600 * 1000); break;
                case "ALL":
                default: cutoffMs = 0; break;
            }
            Date cutoffDate = new Date(cutoffMs);
            List<Expense> filtered = new ArrayList<>();
            for (Expense e : allExpenses) {
                if (cutoffMs == 0 || (e.getExpenseDate() != null && e.getExpenseDate().compareTo(cutoffDate) >= 0)) {
                    filtered.add(e);
                }
            }
            filtered.sort(Comparator.comparing(Expense::getExpenseDate));

            sb.append("\"timeframe\":\"").append(timeframe).append("\",");
            sb.append("\"timeline\":[");
            BigDecimal runningBalance = summary.getTotalIncome();
            for (int i = 0; i < filtered.size(); i++) {
                Expense exp = filtered.get(i);
                runningBalance = runningBalance.subtract(exp.getAmount());
                sb.append(String.format("{\"date\":\"%s\",\"label\":\"%s\",\"amount\":%s,\"balance\":%s}",
                    exp.getExpenseDate(), exp.getTitle().replace("\"", "\\\""), exp.getAmount(), runningBalance));
                if (i < filtered.size() - 1) sb.append(",");
            }
            sb.append("],");

            // Insights
            sb.append("\"insights\":[");
            List<DashboardInsight> insights = summary.getInsights();
            for (int i = 0; i < insights.size(); i++) {
                DashboardInsight ins = insights.get(i);
                sb.append(String.format("{\"type\":\"%s\",\"title\":\"%s\",\"message\":\"%s\"}", ins.getType(), ins.getTitle().replace("\"", "\\\""), ins.getMessage().replace("\"", "\\\"")));
                if (i < insights.size() - 1) sb.append(",");
            }
            sb.append("],");

            // Category Comparisons
            sb.append("\"categoryComparisons\":[");
            List<CategoryComparison> cats = summary.getCategoryComparisons();
            for (int i = 0; i < cats.size(); i++) {
                CategoryComparison c = cats.get(i);
                sb.append(String.format("{\"categoryName\":\"%s\",\"actualAmount\":%s,\"baselineAmount\":%s,\"difference\":%s,\"spendingPercentage\":%s,\"isOver\":%b}", c.getCategoryName().replace("\"", "\\\""), c.getActualAmount(), c.getBaselineAmount(), c.getDifference(), c.getSpendingPercentage(), c.isOver()));
                if (i < cats.size() - 1) sb.append(",");
            }
            sb.append("],");

            // Spending Pace
            SpendingPace pace = summary.getSpendingPace();
            if (pace != null) {
                sb.append(String.format(
                    "\"spendingPace\":{\"daysElapsed\":%d,\"daysInMonth\":%d,\"daysRemaining\":%d,\"discretionaryCapacity\":%s,\"remainingDiscretionaryCapacity\":%s,\"actualSpentMonth\":%s,\"idealPaceToday\":%s,\"dailyAverage\":%s,\"projectedMonthSpend\":%s,\"safeToSpend\":%s,\"dailySafeSpend\":%s,\"paceStatus\":\"%s\",\"explanation\":\"%s\"},",
                    pace.getDaysElapsed(), pace.getDaysInMonth(), pace.getDaysRemaining(), pace.getDiscretionaryCapacity(),
                    pace.getRemainingDiscretionaryCapacity(), pace.getActualSpentMonth(), pace.getIdealPaceToday(),
                    pace.getDailyAverage(), pace.getProjectedMonthSpend(), pace.getSafeToSpend(), pace.getDailySafeSpend(),
                    pace.getPaceStatus(), pace.getExplanation().replace("\"", "\\\"")
                ));
            } else {
                sb.append("\"spendingPace\":null,");
            }

            // Spending Health
            SpendingHealth health = summary.getSpendingHealth();
            if (health != null) {
                sb.append(String.format(
                    "\"spendingHealth\":{\"score\":%d,\"healthLabel\":\"%s\",\"reasons\":[",
                    health.getScore(), health.getHealthLabel().replace("\"", "\\\"")
                ));
                List<String> reasons = health.getReasons();
                if (reasons != null) {
                    for (int i = 0; i < reasons.size(); i++) {
                        sb.append("\"").append(reasons.get(i).replace("\"", "\\\"")).append("\"");
                        if (i < reasons.size() - 1) sb.append(",");
                    }
                }
                sb.append("]}");
            } else {
                sb.append("\"spendingHealth\":null");
            }
            sb.append("}");

            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    // 6. Dashboard Categories Handler
    static class DashboardCategoriesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int userId = Integer.parseInt(params.getOrDefault("userId", "1"));

            DashboardSummary summary = dashboardService.getDashboardSummary(userId);
            StringBuilder sb = new StringBuilder("[");
            List<CategoryComparison> cats = summary.getCategoryComparisons();
            for (int i = 0; i < cats.size(); i++) {
                CategoryComparison c = cats.get(i);
                sb.append(String.format("{\"categoryName\":\"%s\",\"actualAmount\":%s,\"baselineAmount\":%s,\"difference\":%s,\"spendingPercentage\":%s,\"isOver\":%b}", c.getCategoryName().replace("\"", "\\\""), c.getActualAmount(), c.getBaselineAmount(), c.getDifference(), c.getSpendingPercentage(), c.isOver()));
                if (i < cats.size() - 1) sb.append(",");
            }
            sb.append("]");

            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    // 7. Dashboard Insights Handler
    static class DashboardInsightsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int userId = Integer.parseInt(params.getOrDefault("userId", "1"));

            DashboardSummary summary = dashboardService.getDashboardSummary(userId);
            StringBuilder sb = new StringBuilder("[");
            List<DashboardInsight> insights = summary.getInsights();
            for (int i = 0; i < insights.size(); i++) {
                DashboardInsight ins = insights.get(i);
                sb.append(String.format("{\"type\":\"%s\",\"title\":\"%s\",\"message\":\"%s\"}", ins.getType(), ins.getTitle().replace("\"", "\\\""), ins.getMessage().replace("\"", "\\\"")));
                if (i < insights.size() - 1) sb.append(",");
            }
            sb.append("]");

            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    // 8. User Profile & Settings Handler
    static class UserProfileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            String method = exchange.getRequestMethod();
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int userId = Integer.parseInt(params.getOrDefault("userId", "1"));

            if ("GET".equalsIgnoreCase(method)) {
                Optional<User> userOpt = userDAO.findById(userId);
                Optional<SpendingProfile> profileOpt = onboardingService.getSpendingProfile(userId);
                List<Budget> budgets = onboardingService.getUserBudgets(userId);

                String name = userOpt.map(User::getName).orElse("User");
                String email = userOpt.map(User::getEmail).orElse("");
                BigDecimal income = profileOpt.map(SpendingProfile::getMonthlyIncome).orElse(new BigDecimal("50000"));
                BigDecimal savings = profileOpt.map(SpendingProfile::getSavingsTarget).orElse(new BigDecimal("15000"));

                StringBuilder sb = new StringBuilder("{");
                sb.append(String.format("\"userId\":%d,\"name\":\"%s\",\"email\":\"%s\",", userId, name.replace("\"", "\\\""), email.replace("\"", "\\\"")));
                sb.append(String.format("\"monthlyIncome\":%s,\"savingsTarget\":%s,\"categories\":{", income, savings));
                for (int i = 0; i < budgets.size(); i++) {
                    Budget b = budgets.get(i);
                    sb.append(String.format("\"%s\":%s", b.getCategoryName().replace("\"", "\\\""), b.getBaselineAmount()));
                    if (i < budgets.size() - 1) sb.append(",");
                }
                sb.append("}}");
                sendJsonResponse(exchange, 200, sb.toString());
            } else if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                int reqUserId = getJsonInt(body, "userId", userId);
                String name = getJsonString(body, "name");
                BigDecimal income = getJsonBigDecimal(body, "monthlyIncome", new BigDecimal("50000"));
                BigDecimal savings = getJsonBigDecimal(body, "savingsTarget", new BigDecimal("15000"));
                Map<String, BigDecimal> categories = getJsonCategories(body);

                if (!name.isEmpty()) {
                    userDAO.updateUserName(reqUserId, name);
                }
                boolean ok = onboardingService.saveOnboardingProfile(reqUserId, income, savings, categories);
                sendJsonResponse(exchange, ok ? 200 : 400, String.format("{\"success\":%b,\"message\":\"%s\"}", ok, ok ? "Profile updated successfully" : "Failed to update profile"));
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
            }
        }
    }

    // 9. What-If Simulation Handler
    static class WhatIfHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 204, "");
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            int userId = getJsonInt(body, "userId", 1);
            BigDecimal amount = getJsonBigDecimal(body, "amount", new BigDecimal("0"));
            String category = getJsonString(body, "category");
            if (category.isEmpty()) category = "General";

            WhatIfSimulation sim = dashboardService.simulatePurchase(userId, amount, category);

            String json = String.format(
                "{\"purchaseAmount\":%s,\"categoryName\":\"%s\"," +
                "\"currentSafeToSpend\":%s,\"simulatedSafeToSpend\":%s,\"safeToSpendDelta\":%s," +
                "\"currentDailySafeSpend\":%s,\"simulatedDailySafeSpend\":%s,\"dailySafeSpendDelta\":%s," +
                "\"currentPaceStatus\":\"%s\",\"simulatedPaceStatus\":\"%s\"," +
                "\"currentProjectedSpend\":%s,\"simulatedProjectedSpend\":%s," +
                "\"currentHealthScore\":%d,\"simulatedHealthScore\":%d,\"healthScoreDelta\":%d," +
                "\"currentHealthLabel\":\"%s\",\"simulatedHealthLabel\":\"%s\"," +
                "\"categoryCurrentSpent\":%s,\"categoryBaseline\":%s,\"categorySimulatedSpent\":%s,\"categoryExceeded\":%b," +
                "\"impactNarrative\":\"%s\"}",
                sim.getPurchaseAmount(), sim.getCategoryName().replace("\"", "\\\""),
                sim.getCurrentSafeToSpend(), sim.getSimulatedSafeToSpend(), sim.getSafeToSpendDelta(),
                sim.getCurrentDailySafeSpend(), sim.getSimulatedDailySafeSpend(), sim.getDailySafeSpendDelta(),
                sim.getCurrentPaceStatus(), sim.getSimulatedPaceStatus(),
                sim.getCurrentProjectedSpend(), sim.getSimulatedProjectedSpend(),
                sim.getCurrentHealthScore(), sim.getSimulatedHealthScore(), sim.getHealthScoreDelta(),
                sim.getCurrentHealthLabel().replace("\"", "\\\""), sim.getSimulatedHealthLabel().replace("\"", "\\\""),
                sim.getCategoryCurrentSpent(), sim.getCategoryBaseline(), sim.getCategorySimulatedSpent(), sim.isCategoryExceeded(),
                sim.getImpactNarrative().replace("\"", "\\\"")
            );

            sendJsonResponse(exchange, 200, json);
        }
    }
}
