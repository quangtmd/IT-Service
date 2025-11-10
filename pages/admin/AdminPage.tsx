import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, AdminNotification, AdminView } from '../types';
import { useAuth